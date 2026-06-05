package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"booking-api/internal/domain"
	"booking-api/internal/repository"
)

const (
	bookingWindowDays = 14
	slotDuration      = 30 * time.Minute
	workingHoursStart = 9
	workingHoursEnd   = 18
)

type Service struct {
	repo         *repository.Repository
	loc          *time.Location
}

func New(repo *repository.Repository) *Service {
	loc, _ := time.LoadLocation("Europe/Moscow")
	return &Service{
		repo: repo,
		loc:  loc,
	}
}

// EventType operations

func (s *Service) CreateEventType(ctx context.Context, req *repository.EventTypeEntity) (*repository.EventTypeEntity, error) {
	req.ID = uuid.New().String()
	if err := s.repo.CreateEventType(ctx, req); err != nil {
		return nil, err
	}
	return req, nil
}

func (s *Service) GetEventType(ctx context.Context, id string) (*repository.EventTypeEntity, error) {
	entity, err := s.repo.GetEventTypeByID(ctx, id)
	if err != nil {
		return nil, &domain.NotFoundError{Entity: "EventType", ID: id}
	}
	return entity, nil
}

func (s *Service) ListEventTypes(ctx context.Context) ([]repository.EventTypeEntity, error) {
	return s.repo.ListEventTypes(ctx)
}

func (s *Service) UpdateEventType(ctx context.Context, id string, req *repository.EventTypeEntity) (*repository.EventTypeEntity, error) {
	existing, err := s.GetEventType(ctx, id)
	if err != nil {
		return nil, err
	}
	existing.Name = req.Name
	existing.Description = req.Description
	if err := s.repo.UpdateEventType(ctx, existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *Service) DeleteEventType(ctx context.Context, id string) error {
	if err := s.repo.DeleteBookingsByEventType(ctx, id); err != nil {
		return err
	}
	if err := s.repo.DeleteEventType(ctx, id); err != nil {
		return err
	}
	return nil
}

// Booking operations

func (s *Service) CreateBooking(ctx context.Context, req *repository.BookingEntity) (*repository.BookingEntity, error) {
	if err := s.validateBookingTime(req.StartTime); err != nil {
		return nil, err
	}

	if err := s.validateBookingWindow(req.StartTime); err != nil {
		return nil, err
	}

	bookingEnd := req.StartTime.Add(slotDuration)

	conflicting, err := s.repo.FindConflictingBooking(ctx, req.EventTypeID, req.StartTime, bookingEnd)
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}
	if conflicting != nil {
		return nil, &domain.SlotAlreadyBookedError{ConflictingBookingID: conflicting.ID}
	}

	req.ID = uuid.New().String()
	req.EndTime = bookingEnd

	if err := s.repo.CreateBooking(ctx, req); err != nil {
		return nil, err
	}
	return req, nil
}

func (s *Service) CancelBooking(ctx context.Context, id string) error {
	_, err := s.repo.GetBookingByID(ctx, id)
	if err != nil {
		return &domain.NotFoundError{Entity: "Booking", ID: id}
	}
	if err := s.repo.DeleteBooking(ctx, id); err != nil {
		return err
	}
	return nil
}

func (s *Service) ListBookings(ctx context.Context, from, to *time.Time, eventTypeID *string) ([]repository.BookingEntity, error) {
	return s.repo.ListBookings(ctx, from, to, eventTypeID)
}

func (s *Service) GetBooking(ctx context.Context, id string) (*repository.BookingEntity, error) {
	return s.repo.GetBookingByID(ctx, id)
}

// Slots generation

func (s *Service) ListSlots(ctx context.Context, eventTypeID string, from, to *time.Time) ([]SlotInfo, error) {
	_, err := s.GetEventType(ctx, eventTypeID)
	if err != nil {
		return nil, err
	}

	start, end := s.getDefaultWindow()
	if from != nil {
		start = *from
	}
	if to != nil {
		end = *to
	}

	slots := s.generateSlots(start, end)

	bookings, err := s.repo.ListBookings(ctx, &start, &end, &eventTypeID)
	if err != nil {
		return nil, err
	}

	bookedTimes := make(map[string]bool)
	for _, b := range bookings {
		bookedTimes[b.StartTime.Format(time.RFC3339)] = true
	}

	var available []SlotInfo
	for _, slot := range slots {
		if !bookedTimes[slot.Start.Format(time.RFC3339)] {
			available = append(available, slot)
		}
	}

	return available, nil
}

type SlotInfo struct {
	Start time.Time
	End   time.Time
}

func (s *Service) generateSlots(from, to time.Time) []SlotInfo {
	var slots []SlotInfo

	current := from.In(s.loc)
	end := to.In(s.loc)
	now := time.Now().In(s.loc)

	windowEnd := now.AddDate(0, 0, bookingWindowDays)

	if current.Before(now) {
		current = now
	}

	current = s.adjustToNextValidSlot(current)

	for current.Before(end) && current.Before(windowEnd) {
		slotEnd := current.Add(slotDuration)

		if s.isWithinWorkingHours(current) && s.isWeekday(current) {
			slots = append(slots, SlotInfo{
				Start: current.UTC(),
				End:   slotEnd.UTC(),
			})
		}

		current = current.Add(slotDuration)
		if current.Minute()%30 == 0 {
			// already on :00 or :30
		} else {
			// adjust to next :00 or :30
			mins := current.Minute()
			nextMins := ((mins / 30) + 1) * 30
			if nextMins >= 60 {
				current = current.Add(time.Duration(60-current.Minute()) * time.Minute)
			} else {
				current = time.Date(current.Year(), current.Month(), current.Day(),
					current.Hour(), nextMins, 0, 0, s.loc)
			}
		}
	}

	return slots
}

func (s *Service) adjustToNextValidSlot(t time.Time) time.Time {
	loc := s.loc
	t = t.In(loc)
	adjusted := t

	if adjusted.Minute()%30 != 0 {
		mins := adjusted.Minute()
		nextMins := ((mins / 30) + 1) * 30
		if nextMins >= 60 {
			adjusted = time.Date(adjusted.Year(), adjusted.Month(), adjusted.Day(),
				adjusted.Hour()+1, 0, 0, 0, loc)
		} else {
			adjusted = time.Date(adjusted.Year(), adjusted.Month(), adjusted.Day(),
				adjusted.Hour(), nextMins, 0, 0, loc)
		}
	}

	if !s.isWithinWorkingHours(adjusted) {
		nextDay := adjusted.AddDate(0, 0, 1)
		adjusted = time.Date(nextDay.Year(), nextDay.Month(), nextDay.Day(),
			workingHoursStart, 0, 0, 0, loc)
	}

	return adjusted
}

func (s *Service) isWithinWorkingHours(t time.Time) bool {
	hour := t.Hour()
	return hour >= workingHoursStart && hour < workingHoursEnd
}

func (s *Service) isWeekday(t time.Time) bool {
	weekday := t.Weekday()
	return weekday != time.Saturday && weekday != time.Sunday
}

func (s *Service) getDefaultWindow() (time.Time, time.Time) {
	now := time.Now().In(s.loc)
	start := time.Date(now.Year(), now.Month(), now.Day(), workingHoursStart, 0, 0, 0, s.loc)
	end := time.Date(now.Year(), now.Month(), now.Day(), workingHoursEnd, 0, 0, 0, s.loc)
	return start, end
}

func (s *Service) validateBookingTime(t time.Time) error {
	utc := t.UTC()
	local := utc.In(s.loc)

	if !s.isWithinWorkingHours(local) {
		return &domain.ValidationError{Message: "booking time must be within working hours (09:00-18:00 Moscow time)"}
	}

	if !s.isWeekday(local) {
		return &domain.ValidationError{Message: "booking not allowed on weekends"}
	}

	if local.Minute() != 0 && local.Minute() != 30 {
		return &domain.ValidationError{Message: "booking must start at :00 or :30"}
	}

	return nil
}

func (s *Service) validateBookingWindow(t time.Time) error {
	utc := t.UTC()
	now := time.Now().UTC()
	windowEnd := now.AddDate(0, 0, bookingWindowDays)

	if utc.Before(now) || utc.After(windowEnd) {
		return &domain.ValidationError{Message: "booking must be within 14-day window"}
	}

	return nil
}

// Seed seeds initial data if needed
func (s *Service) Seed(ctx context.Context) error {
	return s.repo.SeedEventTypes(ctx)
}
