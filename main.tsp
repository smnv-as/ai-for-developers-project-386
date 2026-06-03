import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{ title: "Booking API" })
@doc("""
API for booking 30-minute appointment slots.

**Business Rules:**
- All events are exactly 30 minutes
- Working hours: 09:00-18:00, Monday-Friday, Europe/Moscow timezone
- Available booking window: 14 days starting from today
- Slots are on :00 and :30 minute boundaries only
- Booking a slot creates a hard delete record; deleting an event type cascades to its bookings
- No authentication; admin operations are under /admin path
""")
namespace BookingApi;

model EventType {
  id: string;
  name: string;
  description: string;
}

model GuestInfo {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
}

model Booking extends GuestInfo {
  id: string;
  eventTypeId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model Slot {
  startTime: utcDateTime;
  endTime: utcDateTime;
}

model CreateEventTypeRequest {
  name: string;
  description: string;
}

model UpdateEventTypeRequest {
  name: string;
  description: string;
}

model CreateBookingRequest {
  eventTypeId: string;
  startTime: utcDateTime;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
}

@error
model NotFoundError {
  code: "not_found";
  message: string;
}

@error
model SlotAlreadyBookedError {
  code: "slot_already_booked";
  message: string;
  conflictingBookingId: string;
}

@error
model ValidationError {
  code: "validation_error";
  message: string;
}

@error
model EventTypeHasBookingsError {
  code: "event_type_has_bookings";
  message: string;
}

@route("/event-types")
interface EventTypes {
  @get listEventTypes(): EventType[];
}

@route("/slots")
interface Slots {
  @get listSlots(@query eventTypeId: string, @query from?: plainDate, @query to?: plainDate): Slot[];
}

@route("/bookings")
interface Bookings {
  @post createBooking(@body request: CreateBookingRequest): Booking | SlotAlreadyBookedError | ValidationError;
  @delete cancelBooking(@path id: string): void | NotFoundError;
}

@route("/admin/event-types")
interface AdminEventTypes {
  @get listAdminEventTypes(): EventType[];
  @post createEventType(@body request: CreateEventTypeRequest): EventType;
  @put updateEventType(@path id: string, @body request: UpdateEventTypeRequest): EventType | NotFoundError;
  @delete deleteEventType(@path id: string): void | NotFoundError | EventTypeHasBookingsError;
}

@route("/admin/bookings")
interface AdminBookings {
  @get listAdminBookings(@query from?: plainDate, @query to?: plainDate, @query eventTypeId?: string): Booking[];
}