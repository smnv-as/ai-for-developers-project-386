import { test, expect } from '../fixtures';

function nextWeekdayAtMoscowHour(hourMoscow: number): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  d.setUTCHours(hourMoscow - 3, 0, 0, 0);
  return d;
}

test.describe('Guest Validation', () => {
  test('should-show-error-for-empty-name', async ({ page, api }) => {
    const eventType = await api.createEventType('Validation Test', 'Testing validation');

    const bookingDate = nextWeekdayAtMoscowHour(12);

    await page.goto(`/booking?eventTypeId=${eventType.id}&startTime=${bookingDate.toISOString()}`);

    await page.locator('[data-testid="guest-email-input"]').fill('test@example.com');

    await page.locator('[data-testid="submit-booking-button"]').click();

    await expect(page.getByText('Введите имя')).toBeVisible();
  });

  test('should-show-error-for-invalid-email', async ({ page, api }) => {
    const eventType = await api.createEventType('Email Validation Test', 'Testing email format');

    const bookingDate = nextWeekdayAtMoscowHour(13);

    await page.goto(`/booking?eventTypeId=${eventType.id}&startTime=${bookingDate.toISOString()}`);

    await page.locator('[data-testid="guest-name-input"]').fill('Test User');

    await page.locator('[data-testid="guest-email-input"]').fill('not-an-email');

    await page.locator('[data-testid="submit-booking-button"]').click();

    await expect(page.getByText('Некорректный email')).toBeVisible();
  });

  test('should-show-error-for-already-booked-slot', async ({ page, api }) => {
    const eventType = await api.createEventType('Double Booking Test', 'Testing slot conflict');

    const bookingDate = nextWeekdayAtMoscowHour(14);

    await api.createBooking({
      eventTypeId: eventType.id,
      startTime: bookingDate.toISOString(),
      guestName: 'First Guest',
      guestEmail: 'first@example.com',
    });

    await page.goto(`/booking?eventTypeId=${eventType.id}&startTime=${bookingDate.toISOString()}`);

    await page.locator('[data-testid="guest-name-input"]').fill('Second Guest');
    await page.locator('[data-testid="guest-email-input"]').fill('second@example.com');

    await page.locator('[data-testid="submit-booking-button"]').click();

    await expect(page.getByTestId('booking-error-alert')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Этот слот уже забронирован')).toBeVisible();
  });
});