import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

test.describe('Slow response (live, intercepted)', () => {
  test('T5.4 — loading spinner shows while response is delayed', async ({ page }) => {
    await seedBeheerderRole(page);
    // Delay the list response by 3s so the loading state is observable
    await page.route('**/hupie/query/**', async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ head: { vars: ['heatpump', 'id'] }, results: { bindings: [] } }),
      });
    });
    await page.goto('/');
    // Spinner should be visible during the delay (assert quickly, before 3s elapses)
    await expect(page.getByTestId('loading-spinner')).toBeVisible({ timeout: 2500 });
  });
});
