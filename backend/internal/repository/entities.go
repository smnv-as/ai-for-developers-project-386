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
	ID          string    `gorm:"primaryKey;type:text"`
	EventTypeID string   `gorm:"type:text;not null;index"`
	StartTime   time.Time `gorm:"type:text;not null;index"`
	EndTime     time.Time `gorm:"type:text;not null"`
	GuestName   string   `gorm:"type:text;not null"`
	GuestEmail  string   `gorm:"type:text;not null"`
	GuestPhone  *string  `gorm:"type:text"`
	Notes       *string  `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}

func (BookingEntity) TableName() string {
	return "bookings"
}
