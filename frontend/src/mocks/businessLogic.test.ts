import { describe, it, expect, beforeEach } from 'vitest'
import { dataStore, resetStore } from './dataStore'
import { generateSlots, validateBookingRequest, generateId } from './businessLogic'

beforeEach(() => {
  resetStore()
})

describe('businessLogic', () => {
  describe('generateSlots', () => {
    it('генерирует слоты только в рабочее время', () => {
      const slots = generateSlots('et-1')
      expect(slots.length).toBeGreaterThan(0)

      slots.forEach((slot) => {
        const date = new Date(slot.startTime)
        const hours = date.getUTCHours()
        expect(hours).toBeGreaterThanOrEqual(9)
        expect(hours).toBeLessThan(18)
      })
    })

    it('генерирует слоты только на xx:00 и xx:30', () => {
      const slots = generateSlots('et-1')

      slots.forEach((slot) => {
        const date = new Date(slot.startTime)
        const minutes = date.getUTCMinutes()
        expect(minutes === 0 || minutes === 30).toBe(true)
      })
    })

    it('исключает уже забронированные слоты', () => {
      const initialBooking = dataStore.bookings[0]
      const slots = generateSlots(initialBooking.eventTypeId)

      const bookedSlot = slots.find((s) => s.startTime === initialBooking.startTime)
      expect(bookedSlot).toBeUndefined()
    })
  })

  describe('validateBookingRequest', () => {
    it('возвращает ошибку для слота в прошлом', () => {
      const result = validateBookingRequest({
        eventTypeId: 'et-1',
        startTime: '2020-01-01T09:00:00.000Z',
        guestName: 'Иван',
        guestEmail: 'ivan@example.com',
      })

      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('validation_error')
    })

    it('возвращает ошибку для уже забронированного слота', () => {
      const existingBooking = dataStore.bookings[0]
      const result = validateBookingRequest({
        eventTypeId: existingBooking.eventTypeId,
        startTime: existingBooking.startTime,
        guestName: 'Иван',
        guestEmail: 'ivan@example.com',
      })

      expect(result.valid).toBe(false)
      expect(result.errorCode).toBe('slot_already_booked')
    })

    it('возвращает валидный результат для корректного запроса', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setUTCHours(10, 0, 0, 0)

      while (tomorrow.getDay() < 1 || tomorrow.getDay() > 5) {
        tomorrow.setDate(tomorrow.getDate() + 1)
      }

      const result = validateBookingRequest({
        eventTypeId: 'et-1',
        startTime: tomorrow.toISOString(),
        guestName: 'Иван',
        guestEmail: 'ivan@example.com',
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('generateId', () => {
    it('генерирует уникальные идентификаторы', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })
})
