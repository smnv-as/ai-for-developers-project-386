import type { Slot, CreateBookingRequest } from '../api/types'
import { isSlotBooked } from './dataStore'

const BOOKING_WINDOW_DAYS = 14
const WORK_START_HOUR = 9
const WORK_END_HOUR = 18
const SLOT_MINUTES = 30

function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

function toUtcDateTime(date: Date): string {
  return date.toISOString()
}

function isInPast(date: Date): boolean {
  return date < new Date()
}

function isOutsideWorkingHours(date: Date): boolean {
  const hours = date.getUTCHours()
  return hours < WORK_START_HOUR || hours >= WORK_END_HOUR
}

export function generateSlots(
  eventTypeId: string,
  from?: string,
  to?: string,
): Slot[] {
  const now = new Date()
  const startDate = from ? new Date(from) : now
  const endDate = to ? new Date(to) : addDays(now, BOOKING_WINDOW_DAYS)

  const slots: Slot[] = []
  let currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)

  const finalDate = new Date(endDate)
  finalDate.setHours(23, 59, 59, 999)

  while (currentDate <= finalDate) {
    if (isWeekday(currentDate) && !isInPast(currentDate)) {
      let slotTime = new Date(currentDate)
      slotTime.setUTCHours(WORK_START_HOUR, 0, 0, 0)

      const endOfWorkDay = new Date(currentDate)
      endOfWorkDay.setUTCHours(WORK_END_HOUR, 0, 0, 0)

      while (slotTime < endOfWorkDay) {
        const slotEnd = addMinutes(slotTime, SLOT_MINUTES)

        if (!isOutsideWorkingHours(slotTime) && !isInPast(slotTime)) {
          const startTimeStr = toUtcDateTime(slotTime)
          const alreadyBooked = isSlotBooked(eventTypeId, startTimeStr)

          if (!alreadyBooked) {
            slots.push({
              startTime: startTimeStr,
              endTime: toUtcDateTime(slotEnd),
            })
          }
        }

        slotTime = slotEnd
      }
    }

    currentDate = addDays(currentDate, 1)
    currentDate.setHours(0, 0, 0, 0)
  }

  return slots
}

export function validateBookingRequest(
  request: CreateBookingRequest,
): { valid: boolean; errorCode?: string; errorMessage?: string } {
  const slotStart = new Date(request.startTime)

  if (isInPast(slotStart)) {
    return {
      valid: false,
      errorCode: 'validation_error',
      errorMessage: 'Нельзя забронировать слот в прошлом',
    }
  }

  if (isOutsideWorkingHours(slotStart)) {
    return {
      valid: false,
      errorCode: 'validation_error',
      errorMessage: 'Слот доступен только в рабочее время (09:00–18:00)',
    }
  }

  const bookingStart = new Date()
  const bookingEnd = addDays(bookingStart, BOOKING_WINDOW_DAYS)
  if (slotStart < bookingStart || slotStart > bookingEnd) {
    return {
      valid: false,
      errorCode: 'validation_error',
      errorMessage: `Бронирование возможно только в течение ${BOOKING_WINDOW_DAYS} дней`,
    }
  }

  const minutes = slotStart.getUTCMinutes()
  if (minutes !== 0 && minutes !== 30) {
    return {
      valid: false,
      errorCode: 'validation_error',
      errorMessage: 'Слоты доступны только на xx:00 и xx:30',
    }
  }

  const existingBooking = isSlotBooked(request.eventTypeId, request.startTime)
  if (existingBooking) {
    return {
      valid: false,
      errorCode: 'slot_already_booked',
      errorMessage: 'Этот слот уже забронирован',
      conflictingBookingId: existingBooking.id,
    }
  }

  return { valid: true }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
