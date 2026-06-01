import { test, expect } from '@playwright/test';

test.describe('Smoke — app boots and renders', () => {
  test('dashboard loads with mock data', async ({ page }) => {
    // Seed the beheerder role before the app boots. The default role is
    // 'installateur', which makes RoleAwareLanding redirect '/' to
    // '/bag-lookup'; seeding 'beheerder' keeps '/' on the dashboard.
    await page.addInitScript(() => {
      window.localStorage.setItem('tdi500-role', 'beheerder');
    });

    await page.goto('/');

    // App shell renders (heading specifically — the brand text also
    // appears in the sidebar, so scope to the role to stay unambiguous)
    await expect(page.getByRole('heading', { name: 'Installateursportaal' })).toBeVisible();

    // Mock-data mode is active (the datasource chip is present)
    await expect(page.getByTestId('datasource-chip')).toBeVisible();

    // The dashboard reaches a loaded state: either KPI cards render,
    // or an empty state shows — but NOT a stuck spinner. Wait for the
    // decision card or a KPI card to confirm data resolved.
    await expect(page.getByTestId('decision-card').or(page.getByTestId('empty-state'))).toBeVisible({ timeout: 15000 });
  });
});
