import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';
import { interceptHupie } from './helpers/hupie';

test.describe('Live-mode interception smoke', () => {
  test('intercepted empty list → app reaches empty state (proves routing works)', async ({ page }) => {
    await seedBeheerderRole(page);
    // Intercept BEFORE navigation: return an empty pump list
    await interceptHupie(page, {
      onList: () => ({ head: { vars: ['heatpump', 'id'] }, results: { bindings: [] } }),
    });
    await page.goto('/');
    // With zero pumps, the dashboard shows the empty state (not live data,
    // not a stuck spinner). This proves our route intercepted the real call.
    await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 15000 });
  });
});
