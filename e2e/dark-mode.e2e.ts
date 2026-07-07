import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

/**
 * Dark-modus — eerste LIVE verificatie van de (voorheen slapende)
 * dark:-styling van de gemigreerde Tailwind-componenten (#172/#173),
 * gesynchroniseerd met MUI's dark mode via de <html>-class.
 *
 * Pixel-niveau bewijs: getComputedStyle op de StatusPill — de gecompileerde
 * `dark:bg-success-600/15` is #16a34a26 → rgba(22, 163, 74, ~0.15).
 * Dit pad is het sjabloon voor dark-verificatie van elke volgende migratie.
 */

test.describe('Dark-modus — unificatie MUI + Tailwind', () => {
  test('toggle zet html.dark en de StatusPill rendert écht dark', async ({ page }) => {
    // Beheerder-rol: de dashboard-landing met de contingent-detail-link
    // (zelfde patroon als contingent.e2e.ts).
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });

    // Licht: geen dark-class.
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Naar de contingent-detail (daar rendert de StatusPill).
    await page.getByTestId('contingent-detail-link').click();
    const pill = page.locator('[data-status="active"]').first();
    await expect(pill).toBeVisible();

    // Licht: tint-paar bg-success-100 = #DCFCE7.
    await expect(pill).toHaveCSS('background-color', 'rgb(220, 252, 231)');

    // Toggle → html.dark + de pil rendert de dark-tint (15%-alpha success).
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    const darkBg = await pill.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg).toMatch(/^rgba\(22, 163, 74, 0\.1[45]\d*\)$/);

    // ErrorCodeRow (indien aanwezig op deze pagina): danger-tier dark-tint.
    const dangerRow = page.locator('[data-severity="danger"]').first();
    if (await dangerRow.count()) {
      const rowBg = await dangerRow.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(rowBg).toMatch(/^rgba\(220, 38, 38, 0\.1[45]\d*\)$/);
    }
  });

  test('StatusDot: semantische stip modus-invariant, offline-stip lichter in dark', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });

    const activeDot = page.locator('[data-testid="pump-status-row"] [data-status="active"]').first();
    const offlineDot = page.locator('[data-testid="pump-status-row"] [data-status="offline"]').first();
    await expect(activeDot).toBeVisible();
    await expect(offlineDot).toBeVisible();

    // Licht: success-600 + canoniek slate-500 (divergentie-2 geland).
    await expect(activeDot).toHaveCSS('background-color', 'rgb(22, 163, 74)');
    await expect(offlineDot).toHaveCSS('background-color', 'rgb(100, 116, 139)');

    // Dark: semantische stip ONGEWIJZIGD (modus-invariant), offline → slate-400.
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(activeDot).toHaveCSS('background-color', 'rgb(22, 163, 74)');
    await expect(offlineDot).toHaveCSS('background-color', 'rgb(148, 163, 184)');
  });

  test('dark blijft na reload: class aanwezig bij eerste load (persistentie + first-paint sync)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    // Direct na load, zonder interactie: de useLayoutEffect zet de class
    // vóór de paint vanuit de dark-persisted localStorage.
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.getByTestId('theme-toggle')).toBeVisible();
  });
});
