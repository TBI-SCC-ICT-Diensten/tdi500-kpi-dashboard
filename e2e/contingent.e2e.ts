import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

test.describe('Contingent detail — navigation (mock data)', () => {
  test('T4.1 — clicking "Naar detail" navigates to contingent detail with pump cards', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });

    // Click the contingent detail link
    await page.getByTestId('contingent-detail-link').click();

    // URL changed to /contingent/:id
    await expect(page).toHaveURL(/\/contingent\//);

    // Pump cards render (mock B2 has 5 pumps)
    const pumpCards = page.getByTestId('contingent-pump-card');
    await expect(pumpCards.first()).toBeVisible({ timeout: 10000 });
    // At least one pump card present (don't hardcode exactly 5 in case mock changes)
    expect(await pumpCards.count()).toBeGreaterThan(0);
  });
});
