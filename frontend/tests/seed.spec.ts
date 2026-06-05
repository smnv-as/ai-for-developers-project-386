import { test } from './fixtures';

test('seed', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});