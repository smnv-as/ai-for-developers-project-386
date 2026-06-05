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

test.describe('Guest Flow', () => {
  test('should-view-event-types', async ({ page, api }) => {
    await api.createEventType('View Test Event', 'Testing event type display');

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /выберите тип события/i })).toBeVisible();

    const cards = page.locator('[data-testid="event-types-grid"] [data-testid^="event-type-card-"]');
    await expect(cards.first()).toBeVisible();
  });

  test('should-navigate-to-slots', async ({ page, api }) => {
    const eventType = await api.createEventType('Navigation Test', 'Testing navigation');

    await page.goto('/');

    await page.locator('[data-testid^="select-event-button-"]').first().click();

    await expect(page).toHaveURL(/\/slots\?eventTypeId=/);
  });

  test('should-view-available-slots', async ({ page, api }) => {
    const eventType = await api.createEventType('Slots View Test', 'Testing slots display');

    await page.goto(`/slots?eventTypeId=${eventType.id}`);

    await expect(page.getByRole('heading', { name: /доступные слоты/i })).toBeVisible();

    await page.waitForLoadState('networkidle');

    const hasSlots = await page.locator('[data-testid^="slot-item-"]').count() > 0;
    const hasNoSlotsMessage = await page.getByText('Нет доступных слотов').isVisible();

    expect(hasSlots || hasNoSlotsMessage).toBeTruthy();
  });

  test('should-navigate-to-booking-form', async ({ page, api }) => {
    const eventType = await api.createEventType('Booking Form Test', 'Testing form navigation');

    await page.goto(`/slots?eventTypeId=${eventType.id}`);
    await page.waitForLoadState('networkidle');

    const bookButton = page.locator('[data-testid^="book-slot-button-"]').first();
    const slotsExist = await bookButton.isVisible().catch(() => false);

    if (slotsExist) {
      await bookButton.click();
      await expect(page).toHaveURL(/\/booking\?eventTypeId=/);
      await expect(page).toHaveURL(/startTime=/);
    } else {
      test.skip();
    }
  });

  test('should-submit-booking-form', async ({ page, api }) => {
    const eventType = await api.createEventType('Form Submit Test', 'Testing form submission');

    const bookingDate = nextWeekdayAtMoscowHour(10);

    await page.goto(`/booking?eventTypeId=${eventType.id}&startTime=${bookingDate.toISOString()}`);

    await expect(page.getByRole('heading', { name: /бронирование/i })).toBeVisible();
    await expect(page.locator('[data-testid="guest-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="guest-email-input"]')).toBeVisible();

    await page.locator('[data-testid="guest-name-input"]').fill('Test Guest');
    await page.locator('[data-testid="guest-email-input"]').fill('test@example.com');

    await page.locator('[data-testid="submit-booking-button"]').click();

    await expect(page).toHaveURL('/success');
    await expect(page.getByTestId('success-heading')).toBeVisible();
  });

  test('should-cancel-booking', async ({ page, api }) => {
    const eventType = await api.createEventType('Cancel Test', 'Testing cancellation');

    const bookingDate = nextWeekdayAtMoscowHour(11);

    const booking = await api.createBooking({
      eventTypeId: eventType.id,
      startTime: bookingDate.toISOString(),
      guestName: 'Cancel Test Guest',
      guestEmail: 'cancel@example.com',
    });

    await api.cancelBooking(booking.id);

    const bookings = await api.getAdminBookings();
    expect(bookings.some(b => b.id === booking.id)).toBeFalsy();
  });
});