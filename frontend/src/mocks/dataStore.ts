import type { EventType, Booking } from '../api/types'

export interface DataStore {
  eventTypes: EventType[]
  bookings: Booking[]
}

const initialEventTypes: EventType[] = [
  { id: 'et-1', name: 'Консультация', description: '30-минутная консультация для ответов на вопросы' },
  { id: 'et-2', name: 'Встреча', description: 'Рабочая встреча для обсуждения проекта' },
  { id: 'et-3', name: 'Интервью', description: 'Собеседование с кандидатом' },
]

const initialBookings: Booking[] = [
  {
    id: 'bk-1',
    eventTypeId: 'et-1',
    startTime: new Date(Date.now() + 86400000).toISOString().replace(/T.*/, 'T09:00:00.000Z'),
    endTime: new Date(Date.now() + 86400000).toISOString().replace(/T.*/, 'T09:30:00.000Z'),
    guestName: 'Иван Петров',
    guestEmail: 'ivan@example.com',
  },
]

export const dataStore: DataStore = {
  eventTypes: [...initialEventTypes],
  bookings: [...initialBookings],
}

export function resetStore() {
  dataStore.eventTypes = [...initialEventTypes]
  dataStore.bookings = [...initialBookings]
}

export function addBooking(booking: Booking) {
  dataStore.bookings.push(booking)
}

export function findEventTypeById(id: string): EventType | undefined {
  return dataStore.eventTypes.find((et) => et.id === id)
}

export function findBookingById(id: string): Booking | undefined {
  return dataStore.bookings.find((b) => b.id === id)
}

export function findBookingsByEventTypeId(eventTypeId: string): Booking[] {
  return dataStore.bookings.filter((b) => b.eventTypeId === eventTypeId)
}

export function isSlotBooked(eventTypeId: string, startTime: string): Booking | undefined {
  return dataStore.bookings.find((b) => b.eventTypeId === eventTypeId && b.startTime === startTime)
}

export function deleteEventTypeCascade(eventTypeId: string): void {
  dataStore.bookings = dataStore.bookings.filter((b) => b.eventTypeId !== eventTypeId)
  dataStore.eventTypes = dataStore.eventTypes.filter((et) => et.id !== eventTypeId)
}
