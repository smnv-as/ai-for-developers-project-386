package domain

import "errors"

var (
	ErrNotFound              = errors.New("entity not found")
	ErrSlotAlreadyBooked     = errors.New("slot already booked")
	ErrEventTypeHasBookings  = errors.New("event type has bookings")
	ErrValidation            = errors.New("validation error")
	ErrOutsideBookingWindow  = errors.New("outside booking window")
	ErrOutsideWorkingHours   = errors.New("outside working hours")
	ErrInvalidSlotBoundary   = errors.New("slot must be on :00 or :30 boundary")
	ErrWeekendNotAllowed     = errors.New("bookings not allowed on weekends")
)

type SlotAlreadyBookedError struct {
	ConflictingBookingID string
}

func (e *SlotAlreadyBookedError) Error() string {
	return "slot already booked"
}

type NotFoundError struct {
	Entity string
	ID     string
}

func (e *NotFoundError) Error() string {
	return e.Entity + " not found: " + e.ID
}

type EventTypeHasBookingsError struct {
	EventTypeID string
}

func (e *EventTypeHasBookingsError) Error() string {
	return "event type has bookings: " + e.EventTypeID
}

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}
