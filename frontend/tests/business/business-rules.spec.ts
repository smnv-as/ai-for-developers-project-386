import { test, expect } from '../fixtures';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function nextWeekday(date: Date): Date {
  const d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

test.describe('Business Rules', () => {
  test('should-generate-slots-on-xx00-and-xx30', async ({ api }) => {
    const eventType = await api.createEventType('Slot Boundaries Test', 'Testing :00 and :30 boundaries');

    const slots = await api.getSlots(eventType.id);

    expect(slots.length).toBeGreaterThan(0);

    for (const slot of slots) {
      const startDate = new Date(slot.startTime);
      const minutes = startDate.getUTCMinutes();

      expect([0, 30]).toContain(minutes);
      const expectedEnd = new Date(startDate.getTime() + 30 * 60 * 1000);
      expect(new Date(slot.endTime).getTime()).toBeLessThanOrEqual(expectedEnd.getTime() + 100);
      expect(new Date(slot.endTime).getTime()).toBeGreaterThanOrEqual(expectedEnd.getTime() - 100);
    }
  });

  test('should-generate-slots-only-for-weekdays', async ({ api }) => {
    const eventType = await api.createEventType('Weekdays Test', 'Testing weekday-only slots');

    const slots = await api.getSlots(eventType.id);

    expect(slots.length).toBeGreaterThan(0);

    for (const slot of slots) {
      const startDate = new Date(slot.startTime);
      const dayOfWeek = startDate.getUTCDay();

      expect(dayOfWeek).not.toBe(0); // Sunday
      expect(dayOfWeek).not.toBe(6); // Saturday
    }
  });

  test('should-generate-slots-only-in-working-hours', async ({ api }) => {
    const eventType = await api.createEventType('Working Hours Test', 'Testing 09:00-18:00');

    const slots = await api.getSlots(eventType.id);

    expect(slots.length).toBeGreaterThan(0);

    for (const slot of slots) {
      const startDate = new Date(slot.startTime);
      const moscowTime = startDate.toLocaleString('en-US', { timeZone: 'Europe/Moscow', hour: 'numeric', hour12: false });
      const moscowHour = parseInt(moscowTime, 10);

      expect(moscowHour).toBeGreaterThanOrEqual(9);
      expect(moscowHour).toBeLessThanOrEqual(17);
    }
  });

  test('should-enforce-14-day-booking-window', async ({ api }) => {
    const eventType = await api.createEventType('14 Day Window Test', 'Testing booking window');

    const farFuture = addDays(new Date(), 20);
    farFuture.setHours(10, 0, 0, 0);

    let errorReceived = false;
    let errorMessage = '';

    try {
      await api.createBooking({
        eventTypeId: eventType.id,
        startTime: farFuture.toISOString(),
        guestName: 'Window Test',
        guestEmail: 'window@example.com',
      });
    } catch (err) {
      if (err instanceof api.ApiError) {
        errorReceived = true;
        errorMessage = err.message;
      }
    }

    expect(errorReceived).toBeTruthy();
    expect(errorMessage.toLowerCase()).toContain('14');

    const withinWindow = addDays(new Date(), 7);
    withinWindow.setHours(10, 0, 0, 0);

    const booking = await api.createBooking({
      eventTypeId: eventType.id,
      startTime: withinWindow.toISOString(),
      guestName: 'Within Window Guest',
      guestEmail: 'withindow@example.com',
    });

    expect(booking.id).toBeDefined();
  });
});