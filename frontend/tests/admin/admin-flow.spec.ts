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

test.describe('Admin Flow', () => {
  test('should-view-admin-panel', async ({ page }) => {
    await page.goto('/admin');

    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should-create-event-type', async ({ page, api }) => {
    const uniqueName = `Admin Created ${Date.now()}`;

    await page.goto('/admin/event-types');

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /create/i }).click();

    await page.waitForURL(/\/create$/);

    await page.locator('input[name="name"]').fill(uniqueName);
    await page.locator('textarea[name="description"]').fill('Testing admin creation');

    await page.getByRole('button', { name: /save/i }).click();

    await page.waitForURL(/\/event-types$/);
    await expect(page.getByText(uniqueName)).toBeVisible();
  });

  test('should-view-bookings-list', async ({ page, api }) => {
    const eventType = await api.createEventType('Bookings List Test', 'Testing bookings list');

    const bookingDate = nextWeekdayAtMoscowHour(15);

    const booking = await api.createBooking({
      eventTypeId: eventType.id,
      startTime: bookingDate.toISOString(),
      guestName: 'Bookings List Guest',
      guestEmail: 'bookingslist@example.com',
    });

    await page.goto('/admin/bookings');

    await page.waitForLoadState('networkidle');

    await expect(page.getByText(booking.guestName)).toBeVisible();
    await expect(page.getByText(booking.guestEmail)).toBeVisible();
  });

  test('should-cascade-delete-event-type', async ({ page, api }) => {
    const eventType = await api.createEventType('Cascade Delete Test', 'Testing cascade delete');

    const bookingDate = nextWeekdayAtMoscowHour(16);

    await api.createBooking({
      eventTypeId: eventType.id,
      startTime: bookingDate.toISOString(),
      guestName: 'Cascade Test Guest',
      guestEmail: 'cascade@example.com',
    });

    await page.goto('/admin/event-types');

    await page.waitForLoadState('networkidle');

    const row = page.locator(`tr:has-text("${eventType.name}")`).first();
    await row.locator('button[aria-label="Delete"]').click();

    await page.waitForTimeout(500);
    const confirmButton = page.getByRole('button', { name: /confirm/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await page.waitForTimeout(1000);

    await expect(page.getByText(eventType.name)).not.toBeVisible();

    await page.goto('/admin/bookings');
    await expect(page.getByText('Cascade Test Guest')).not.toBeVisible();
  });
});