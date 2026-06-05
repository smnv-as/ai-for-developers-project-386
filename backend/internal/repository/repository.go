package repository

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func New(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) AutoMigrate() error {
	return r.db.AutoMigrate(&EventTypeEntity{}, &BookingEntity{})
}

func (r *Repository) Close() error {
	sqlDB, err := r.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// EventType operations

func (r *Repository) CreateEventType(ctx context.Context, entity *EventTypeEntity) error {
	return r.db.WithContext(ctx).Create(entity).Error
}

func (r *Repository) GetEventTypeByID(ctx context.Context, id string) (*EventTypeEntity, error) {
	var entity EventTypeEntity
	err := r.db.WithContext(ctx).First(&entity, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *Repository) ListEventTypes(ctx context.Context) ([]EventTypeEntity, error) {
	var entities []EventTypeEntity
	err := r.db.WithContext(ctx).Find(&entities).Error
	return entities, err
}

func (r *Repository) UpdateEventType(ctx context.Context, entity *EventTypeEntity) error {
	return r.db.WithContext(ctx).Save(entity).Error
}

func (r *Repository) DeleteEventType(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&EventTypeEntity{}, "id = ?", id).Error
}

func (r *Repository) EventTypeHasBookings(ctx context.Context, eventTypeID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&BookingEntity{}).Where("event_type_id = ?", eventTypeID).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *Repository) DeleteBookingsByEventType(ctx context.Context, eventTypeID string) error {
	return r.db.WithContext(ctx).Where("event_type_id = ?", eventTypeID).Delete(&BookingEntity{}).Error
}

// Booking operations

func (r *Repository) CreateBooking(ctx context.Context, entity *BookingEntity) error {
	return r.db.WithContext(ctx).Create(entity).Error
}

func (r *Repository) GetBookingByID(ctx context.Context, id string) (*BookingEntity, error) {
	var entity BookingEntity
	err := r.db.WithContext(ctx).First(&entity, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *Repository) DeleteBooking(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&BookingEntity{}, "id = ?", id).Error
}

func (r *Repository) ListBookings(ctx context.Context, from, to *time.Time, eventTypeID *string) ([]BookingEntity, error) {
	query := r.db.WithContext(ctx)

	if from != nil {
		query = query.Where("start_time >= ?", from.Format("2006-01-02 15:04:05.999999999+00:00"))
	}
	if to != nil {
		query = query.Where("start_time < ?", to.Format("2006-01-02 15:04:05.999999999+00:00"))
	}
	if eventTypeID != nil && *eventTypeID != "" {
		query = query.Where("event_type_id = ?", *eventTypeID)
	}

	var entities []BookingEntity
	err := query.Find(&entities).Error
	return entities, err
}

func (r *Repository) FindConflictingBooking(ctx context.Context, eventTypeID string, startTime, endTime time.Time) (*BookingEntity, error) {
	var entity BookingEntity
	err := r.db.WithContext(ctx).Where(
		"event_type_id = ? AND start_time < ? AND end_time > ?",
		eventTypeID, endTime.Format("2006-01-02 15:04:05.999999999+00:00"), startTime.Format("2006-01-02 15:04:05.999999999+00:00"),
	).First(&entity).Error
	if err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *Repository) Transaction(ctx context.Context, fn func(tx *Repository) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(&Repository{db: tx})
	})
}

func (r *Repository) SeedEventTypes(ctx context.Context) error {
	var count int64
	r.db.WithContext(ctx).Model(&EventTypeEntity{}).Count(&count)
	if count > 0 {
		return nil
	}

	seeds := []EventTypeEntity{
		{ID: "type-1", Name: "Consultation", Description: "30-minute consultation call"},
		{ID: "type-2", Name: "Interview", Description: "Technical interview"},
		{ID: "type-3", Name: "Demo", Description: "Product demo"},
	}

	for _, seed := range seeds {
		if err := r.db.WithContext(ctx).Create(&seed).Error; err != nil {
			return err
		}
	}
	return nil
}
