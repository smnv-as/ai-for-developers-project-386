package handler

import (
	"context"
	"time"

	"booking-api/internal/api"
	"booking-api/internal/domain"
	"booking-api/internal/mapper"
	"booking-api/internal/service"
)

type Handler struct {
	svc *service.Service
}

func New(svc *service.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) AdminBookingsListAdminBookings(ctx context.Context, request api.AdminBookingsListAdminBookingsRequestObject) (api.AdminBookingsListAdminBookingsResponseObject, error) {
	var from, to *time.Time
	if request.Params.From != nil {
		t := time.Date(request.Params.From.Year(), request.Params.From.Month(), request.Params.From.Day(), 0, 0, 0, 0, time.UTC)
		from = &t
	}
	if request.Params.To != nil {
		t := time.Date(request.Params.To.Year(), request.Params.To.Month(), request.Params.To.Day(), 23, 59, 59, 0, time.UTC)
		to = &t
	}
	var eventTypeID *string
	if request.Params.EventTypeId != nil {
		eventTypeID = request.Params.EventTypeId
	}

	entities, err := h.svc.ListBookings(ctx, from, to, eventTypeID)
	if err != nil {
		return nil, err
	}

	apiBookings := make([]api.Booking, len(entities))
	for i, e := range entities {
		apiBookings[i] = mapper.BookingEntityToAPI(&e)
	}

	return api.AdminBookingsListAdminBookings200JSONResponse(apiBookings), nil
}

func (h *Handler) AdminEventTypesListAdminEventTypes(ctx context.Context, request api.AdminEventTypesListAdminEventTypesRequestObject) (api.AdminEventTypesListAdminEventTypesResponseObject, error) {
	entities, err := h.svc.ListEventTypes(ctx)
	if err != nil {
		return nil, err
	}

	apiTypes := make([]api.EventType, len(entities))
	for i, e := range entities {
		apiTypes[i] = mapper.EventTypeEntityToAPI(&e)
	}

	return api.AdminEventTypesListAdminEventTypes200JSONResponse(apiTypes), nil
}

func (h *Handler) AdminEventTypesCreateEventType(ctx context.Context, request api.AdminEventTypesCreateEventTypeRequestObject) (api.AdminEventTypesCreateEventTypeResponseObject, error) {
	entity := mapper.CreateEventTypeRequestToEntity(request.Body)
	created, err := h.svc.CreateEventType(ctx, &entity)
	if err != nil {
		return nil, err
	}

	return api.AdminEventTypesCreateEventType200JSONResponse(mapper.EventTypeEntityToAPI(created)), nil
}

func (h *Handler) AdminEventTypesUpdateEventType(ctx context.Context, request api.AdminEventTypesUpdateEventTypeRequestObject) (api.AdminEventTypesUpdateEventTypeResponseObject, error) {
	entity := mapper.UpdateEventTypeRequestToEntity(request.Body)
	updated, err := h.svc.UpdateEventType(ctx, request.Id, &entity)
	if err != nil {
		if _, ok := err.(*domain.NotFoundError); ok {
			return api.AdminEventTypesUpdateEventTypedefaultJSONResponse{
				StatusCode: 404,
				Body:       api.NotFoundError{},
			}, nil
		}
		return nil, err
	}

	return api.AdminEventTypesUpdateEventType200JSONResponse(mapper.EventTypeEntityToAPI(updated)), nil
}

func (h *Handler) AdminEventTypesDeleteEventType(ctx context.Context, request api.AdminEventTypesDeleteEventTypeRequestObject) (api.AdminEventTypesDeleteEventTypeResponseObject, error) {
	err := h.svc.DeleteEventType(ctx, request.Id)
	if err != nil {
		if _, ok := err.(*domain.NotFoundError); ok {
			body := api.AdminEventTypesDeleteEventTypedefaultJSONResponseBody{}
			body.FromNotFoundError(api.NotFoundError{})
			return api.AdminEventTypesDeleteEventTypedefaultJSONResponse{
				StatusCode: 404,
				Body:       body,
			}, nil
		}
		if ete, ok := err.(*domain.EventTypeHasBookingsError); ok {
			body := api.AdminEventTypesDeleteEventTypedefaultJSONResponseBody{}
			body.FromEventTypeHasBookingsError(api.EventTypeHasBookingsError{
				Code:    api.EventTypeHasBookings,
				Message: ete.Error(),
			})
			return api.AdminEventTypesDeleteEventTypedefaultJSONResponse{
				StatusCode: 400,
				Body:       body,
			}, nil
		}
		return nil, err
	}

	return api.AdminEventTypesDeleteEventType204Response{}, nil
}

func (h *Handler) BookingsCreateBooking(ctx context.Context, request api.BookingsCreateBookingRequestObject) (api.BookingsCreateBookingResponseObject, error) {
	entity := mapper.CreateBookingRequestToEntity(request.Body)
	created, err := h.svc.CreateBooking(ctx, &entity)
	if err != nil {
		if sae, ok := err.(*domain.SlotAlreadyBookedError); ok {
			body := api.BookingsCreateBookingdefaultJSONResponseBody{}
			body.FromSlotAlreadyBookedError(api.SlotAlreadyBookedError{
				Code:                 api.SlotAlreadyBooked,
				ConflictingBookingId: sae.ConflictingBookingID,
				Message:             sae.Error(),
			})
			return api.BookingsCreateBookingdefaultJSONResponse{
				StatusCode: 400,
				Body:        body,
			}, nil
		}
		if ve, ok := err.(*domain.ValidationError); ok {
			body := api.BookingsCreateBookingdefaultJSONResponseBody{}
			body.FromValidationError(api.ValidationError{
				Code:    api.ValidationErrorCodeValidationError,
				Message: ve.Message,
			})
			return api.BookingsCreateBookingdefaultJSONResponse{
				StatusCode: 400,
				Body:        body,
			}, nil
		}
		return nil, err
	}

	return api.BookingsCreateBooking200JSONResponse(mapper.BookingEntityToAPI(created)), nil
}

func (h *Handler) BookingsCancelBooking(ctx context.Context, request api.BookingsCancelBookingRequestObject) (api.BookingsCancelBookingResponseObject, error) {
	err := h.svc.CancelBooking(ctx, request.Id)
	if err != nil {
		if _, ok := err.(*domain.NotFoundError); ok {
			return api.BookingsCancelBookingdefaultJSONResponse{
				StatusCode: 404,
				Body:       api.NotFoundError{},
			}, nil
		}
		return nil, err
	}

	return api.BookingsCancelBooking204Response{}, nil
}

func (h *Handler) EventTypesListEventTypes(ctx context.Context, request api.EventTypesListEventTypesRequestObject) (api.EventTypesListEventTypesResponseObject, error) {
	entities, err := h.svc.ListEventTypes(ctx)
	if err != nil {
		return nil, err
	}

	apiTypes := make([]api.EventType, len(entities))
	for i, e := range entities {
		apiTypes[i] = mapper.EventTypeEntityToAPI(&e)
	}

	return api.EventTypesListEventTypes200JSONResponse(apiTypes), nil
}

func (h *Handler) SlotsListSlots(ctx context.Context, request api.SlotsListSlotsRequestObject) (api.SlotsListSlotsResponseObject, error) {
	var from, to *time.Time
	if request.Params.From != nil {
		t := time.Date(request.Params.From.Year(), request.Params.From.Month(), request.Params.From.Day(), 0, 0, 0, 0, time.UTC)
		from = &t
	}
	if request.Params.To != nil {
		t := time.Date(request.Params.To.Year(), request.Params.To.Month(), request.Params.To.Day(), 23, 59, 59, 0, time.UTC)
		to = &t
	}

	slots, err := h.svc.ListSlots(ctx, request.Params.EventTypeId, from, to)
	if err != nil {
		return nil, err
	}

	apiSlots := make([]api.Slot, len(slots))
	for i, slot := range slots {
		apiSlots[i] = api.Slot{
			StartTime: slot.Start,
			EndTime:   slot.End,
		}
	}

	return api.SlotsListSlots200JSONResponse(apiSlots), nil
}
