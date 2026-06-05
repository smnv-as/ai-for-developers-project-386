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

test.describe('Integration / Smoke', () => {
  test('should-complete-full-guest-journey', async ({ page, api }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /выберите тип события/i })).toBeVisible();

    const eventType = await api.createEventType(`E2E Journey ${Date.now()}`, 'Full journey test');

    await page.reload();

    await page.locator('[data-testid^="select-event-button-"]').first().click();

    await expect(page).toHaveURL(/\/slots\?eventTypeId=/);
    await expect(page.getByRole('heading', { name: /доступные слоты/i })).toBeVisible();

    await page.waitForLoadState('networkidle');

    const slotsExist = await page.locator('[data-testid^="book-slot-button-"]').count() > 0;

    if (slotsExist) {
      await page.locator('[data-testid^="book-slot-button-"]').first().click();

      await expect(page).toHaveURL(/\/booking\?eventTypeId=/);
      await page.locator('[data-testid="guest-name-input"]').fill('E2E Гость');
      await page.locator('[data-testid="guest-email-input"]').fill('e2e@example.com');

      await page.locator('[data-testid="submit-booking-button"]').click();

      await expect(page).toHaveURL('/success');
      await expect(page.getByTestId('success-heading')).toBeVisible();

      await page.goto('/admin/bookings');
      await expect(page.getByText('E2E Гость')).toBeVisible();
    } else {
      await expect(page.getByText('Нет доступных слотов')).toBeVisible();
    }
  });

  test('should-sync-admin-created-event-types', async ({ page, api }) => {
    const created = await api.createEventType(
      `Test Event Type ${Date.now()}`,
      'Description for testing'
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator(`[data-testid="event-type-card-${created.id}"]`)).toBeVisible();
    await expect(page.getByText(created.name)).toBeVisible();
    await expect(page.getByText(created.description)).toBeVisible();
  });

  test('should-reflect-booking-in-admin-immediately', async ({ page, api }) => {
    const eventType = await api.createEventType(
      `Booking Test ${Date.now()}`,
      'Testing booking visibility'
    );

    const bookingDate = nextWeekdayAtMoscowHour(10);

    const booking = await api.createBooking({
      eventTypeId: eventType.id,
      startTime: bookingDate.toISOString(),
      guestName: 'Admin Test Guest',
      guestEmail: 'admintest@example.com',
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(booking.guestName)).toBeVisible();
    await expect(page.getByText(booking.guestEmail)).toBeVisible();
  });
});