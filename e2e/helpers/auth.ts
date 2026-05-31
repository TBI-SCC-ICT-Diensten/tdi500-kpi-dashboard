import type { Page } from '@playwright/test';

/**
 * Seeds the beheerder role in localStorage before navigation so the app
 * lands on the dashboard (/) instead of redirecting installateurs to
 * /bag-lookup. Use before page.goto('/') in dashboard-facing specs.
 */
export async function seedBeheerderRole(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('tdi500-role', 'beheerder');
  });
}
