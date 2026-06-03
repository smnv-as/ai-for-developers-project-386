import { http, HttpResponse } from 'msw'
import {
  dataStore,
  addBooking,
  findEventTypeById,
  findBookingById,
  deleteEventTypeCascade,
} from './dataStore'
import { validateBookingRequest, generateSlots, generateId } from './businessLogic'
import type { CreateBookingRequest, CreateEventTypeRequest, UpdateEventTypeRequest } from '../api/types'

export const handlers = [
  http.get('/event-types', () => {
    return HttpResponse.json(dataStore.eventTypes)
  }),

  http.get('/slots', ({ request }) => {
    const url = new URL(request.url)
    const eventTypeId = url.searchParams.get('eventTypeId') ?? ''
    const from = url.searchParams.get('from') ?? undefined
    const to = url.searchParams.get('to') ?? undefined

    const slots = generateSlots(eventTypeId, from, to)
    return HttpResponse.json(slots)
  }),

  http.post('/bookings', async ({ request }) => {
    const body = (await request.json()) as CreateBookingRequest

    const validation = validateBookingRequest(body)
    if (!validation.valid) {
      if (validation.errorCode === 'slot_already_booked') {
        return HttpResponse.json(
          {
            code: 'slot_already_booked' as const,
            message: validation.errorMessage,
            conflictingBookingId: validation.conflictingBookingId,
          },
          { status: 409 },
        )
      }
      return HttpResponse.json(
        {
          code: validation.errorCode,
          message: validation.errorMessage,
        },
        { status: 422 },
      )
    }

    const booking = {
      id: generateId(),
      eventTypeId: body.eventTypeId,
      startTime: body.startTime,
      endTime: body.startTime,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
      notes: body.notes,
    }

    addBooking(booking)
    return HttpResponse.json(booking, { status: 200 })
  }),

  http.delete('/bookings/:id', ({ params }) => {
    const { id } = params as { id: string }
    const booking = findBookingById(id)

    if (!booking) {
      return HttpResponse.json(
        { code: 'not_found', message: 'Бронирование не найдено' },
        { status: 404 },
      )
    }

    const index = dataStore.bookings.findIndex((b) => b.id === id)
    if (index !== -1) {
      dataStore.bookings.splice(index, 1)
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/admin/event-types', () => {
    return HttpResponse.json(dataStore.eventTypes)
  }),

  http.post('/admin/event-types', async ({ request }) => {
    const body = (await request.json()) as CreateEventTypeRequest
    const newEventType = {
      id: `et-${Date.now()}`,
      name: body.name,
      description: body.description,
    }
    dataStore.eventTypes.push(newEventType)
    return HttpResponse.json(newEventType, { status: 200 })
  }),

  http.put('/admin/event-types/:id', async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = (await request.json()) as UpdateEventTypeRequest
    const eventType = findEventTypeById(id)

    if (!eventType) {
      return HttpResponse.json(
        { code: 'not_found', message: 'Тип события не найден' },
        { status: 404 },
      )
    }

    const index = dataStore.eventTypes.findIndex((et) => et.id === id)
    dataStore.eventTypes[index] = { ...eventType, ...body }
    return HttpResponse.json(dataStore.eventTypes[index])
  }),

  http.delete('/admin/event-types/:id', ({ params }) => {
    const { id } = params as { id: string }
    const eventType = findEventTypeById(id)

    if (!eventType) {
      return HttpResponse.json(
        { code: 'not_found', message: 'Тип события не найден' },
        { status: 404 },
      )
    }

    const hasBookings = dataStore.bookings.some((b) => b.eventTypeId === id)
    if (hasBookings) {
      return HttpResponse.json(
        {
          code: 'event_type_has_bookings',
          message: 'Нельзя удалить тип события, связанный с бронированиями',
        },
        { status: 409 },
      )
    }

    deleteEventTypeCascade(id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/admin/bookings', ({ request }) => {
    const url = new URL(request.url)
    const from = url.searchParams.get('from') ?? undefined
    const to = url.searchParams.get('to') ?? undefined
    const eventTypeId = url.searchParams.get('eventTypeId') ?? undefined

    let bookings = [...dataStore.bookings]

    if (from) {
      const fromDate = new Date(from)
      bookings = bookings.filter((b) => new Date(b.startTime) >= fromDate)
    }
    if (to) {
      const toDate = new Date(to)
      bookings = bookings.filter((b) => new Date(b.startTime) <= toDate)
    }
    if (eventTypeId) {
      bookings = bookings.filter((b) => b.eventTypeId === eventTypeId)
    }

    return HttpResponse.json(bookings)
  }),
]
