export interface EventType {
  id: string
  name: string
  description: string
}

export interface Booking {
  id: string
  eventTypeId: string
  startTime: string
  endTime: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  notes?: string
}

export interface Slot {
  startTime: string
  endTime: string
}

export interface CreateBookingRequest {
  eventTypeId: string
  startTime: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  notes?: string
}

export interface CreateEventTypeRequest {
  name: string
  description: string
}

export interface UpdateEventTypeRequest {
  name: string
  description: string
}

export interface ApiError {
  code: string
  message: string
}

export interface NotFoundError extends ApiError {
  code: 'not_found'
}

export interface SlotAlreadyBookedError extends ApiError {
  code: 'slot_already_booked'
  conflictingBookingId: string
}

export interface ValidationError extends ApiError {
  code: 'validation_error'
}

export interface EventTypeHasBookingsError extends ApiError {
  code: 'event_type_has_bookings'
}

export interface ListAdminBookingsParams {
  from?: string
  to?: string
  eventTypeId?: string
}

export interface ListSlotsParams {
  eventTypeId: string
  from?: string
  to?: string
}
