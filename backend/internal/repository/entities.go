package repository

import (
	"time"
)

type EventTypeEntity struct {
	ID          string    `gorm:"primaryKey;type:text"`
	Name        string    `gorm:"type:text;not null"`
	Description string    `gorm:"type:text;not null"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}

func (EventTypeEntity) TableName() string {
	return "event_types"
}

type BookingEntity struct {
	ID          string    `gorm:"primaryKey"`
	EventTypeID string   `gorm:"index"`
	StartTime   time.Time `gorm:"index"`
	EndTime     time.Time
	GuestName   string
	GuestEmail  string
	GuestPhone  *string
	Notes       *string
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}

func (BookingEntity) TableName() string {
	return "bookings"
}
