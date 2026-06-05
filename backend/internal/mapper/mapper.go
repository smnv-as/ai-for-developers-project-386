package mapper

import (
	"time"

	"booking-api/internal/api"
	"booking-api/internal/repository"
)

func EventTypeEntityToAPI(entity *repository.EventTypeEntity) api.EventType {
	return api.EventType{
		Description: entity.Description,
		Id:          entity.ID,
		Name:        entity.Name,
	}
}

func EventTypeEntityToAPISlice(entities []repository.EventTypeEntity) []api.EventType {
	result := make([]api.EventType, len(entities))
	for i, e := range entities {
		result[i] = EventTypeEntityToAPI(&e)
	}
	return result
}

func CreateEventTypeRequestToEntity(req *api.CreateEventTypeRequest) repository.EventTypeEntity {
	return repository.EventTypeEntity{
		Description: req.Description,
		Name:        req.Name,
	}
}

func UpdateEventTypeRequestToEntity(req *api.UpdateEventTypeRequest) repository.EventTypeEntity {
	return repository.EventTypeEntity{
		Description: req.Description,
		Name:        req.Name,
	}
}

func BookingEntityToAPI(entity *repository.BookingEntity) api.Booking {
	return api.Booking{
		GuestEmail: entity.GuestEmail,
		GuestName:  entity.GuestName,
		GuestPhone: entity.GuestPhone,
		Notes:      entity.Notes,
		EventTypeId: entity.EventTypeID,
		Id:         entity.ID,
		StartTime:  entity.StartTime,
		EndTime:    entity.EndTime,
	}
}

func BookingEntityToAPISlice(entities []repository.BookingEntity) []api.Booking {
	result := make([]api.Booking, len(entities))
	for i, e := range entities {
		result[i] = BookingEntityToAPI(&e)
	}
	return result
}

func CreateBookingRequestToEntity(req *api.CreateBookingRequest) repository.BookingEntity {
	return repository.BookingEntity{
		EventTypeID: req.EventTypeId,
		StartTime:   req.StartTime,
		EndTime:     req.StartTime.Add(30 * time.Minute),
		GuestName:   req.GuestName,
		GuestEmail:  req.GuestEmail,
		GuestPhone:  req.GuestPhone,
		Notes:       req.Notes,
	}
}
