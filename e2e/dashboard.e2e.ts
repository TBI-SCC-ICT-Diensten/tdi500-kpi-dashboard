import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

test.describe('Dashboard — happy path (mock data)', () => {
  test.beforeEach(async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    // Wait for data to resolve — decision card or KPI cards present
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });
  });

  test('T5.1 — desktop layout renders KPI cards, gauge, and decision card', async ({ page }) => {
    // KPI cards (4 in mock B2: cop, connectivity, storingen, inregelsnelheid)
    await expect(page.getByTestId('kpi-card-cop')).toBeVisible();
    await expect(page.getByTestId('kpi-card-connectivity')).toBeVisible();
    await expect(page.getByTestId('kpi-card-storingen')).toBeVisible();
    await expect(page.getByTestId('kpi-card-inregelsnelheid')).toBeVisible();
    // COP gauge
    await expect(page.getByTestId('cop-gauge')).toBeVisible();
    // Decision card
    await expect(page.getByTestId('decision-card')).toBeVisible();
  });

  test('T6.1 — KPI charts render with data', async ({ page }) => {
    await expect(page.getByTestId('chart-temperature-trend')).toBeVisible();
    await expect(page.getByTestId('chart-energy-comparison')).toBeVisible();
  });

  test('T7.1 — decision verdict is displayed', async ({ page }) => {
    const verdict = page.getByTestId('decision-verdict');
    await expect(verdict).toBeVisible();
    // The verdict shows one of the known labels (mock B2 → "Acceptabel",
    // but assert it's one of the valid set rather than hardcoding, so the
    // test doesn't break if mock data shifts the score)
    await expect(verdict).toHaveText(/Goed|Acceptabel|Onvoldoende/);
  });
});
