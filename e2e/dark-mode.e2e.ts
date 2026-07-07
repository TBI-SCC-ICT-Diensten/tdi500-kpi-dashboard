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

  test('DecisionFactorRow: chip text-safe -700→-300, icoon canoniek -600 modus-invariant', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });

    // Canonieke waarden na divergentie-1: chip-tekst = text-safe (-700 licht /
    // -300 dark), icoon = levendige main (-600, modus-invariant net als de dot).
    // De factor-score is een 3-tal (good/acceptable/poor) → nooit offline.
    const SAFE_LIGHT: Record<string, string> = {
      healthy: 'rgb(21, 128, 61)', warning: 'rgb(180, 83, 9)', danger: 'rgb(185, 28, 28)',
    };
    const SAFE_DARK: Record<string, string> = {
      healthy: 'rgb(134, 239, 172)', warning: 'rgb(252, 211, 77)', danger: 'rgb(252, 165, 165)',
    };
    const ICON_MAIN: Record<string, string> = {
      healthy: 'rgb(22, 163, 74)', warning: 'rgb(217, 119, 6)', danger: 'rgb(220, 38, 38)',
    };

    // Eerste factor-rij; lees de semantiek en toets ertegen (robuust voor
    // welke score de mock ook oplevert).
    const row = page.locator('[data-testid="decision-factor"]').first();
    await expect(row).toBeVisible();
    const semantic = (await row.getAttribute('data-semantic')) as 'healthy' | 'warning' | 'danger';
    expect(['healthy', 'warning', 'danger']).toContain(semantic);

    const chip = row.locator('.rounded-full');
    const icon = row.locator('svg');

    // Licht: chip-tekst de text-safe -700 (AA op wit), icoon de levendige -600.
    await expect(chip).toHaveCSS('color', SAFE_LIGHT[semantic]);
    await expect(icon).toHaveCSS('color', ICON_MAIN[semantic]);

    // Toggle → dark: chip-tekst -300 (leesbaar op donker), icoon ONGEWIJZIGD -600.
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(chip).toHaveCSS('color', SAFE_DARK[semantic]);
    await expect(icon).toHaveCSS('color', ICON_MAIN[semantic]);
  });

  test('KpiStatusIcon: tint-surface -100 → 15%-alpha dark, icoon canoniek -600 modus-invariant', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });

    // De KPI-status-chip is een tint-SURFACE (bg-only) die het -600-icoon host.
    // Licht: bg-*-100 = de oude MUI `*.light` EXACT (strikte no-op). Dark: de
    // nette 15%-alpha main — géén fel modus-blind #DCFCE7-vlak meer. Icoon = de
    // levendige -600, modus-invariant (net als de dot/factor-icoon). De
    // KPI-status is een 3-tal (good/warning/critical) → nooit offline.
    const TINT_LIGHT: Record<string, string> = {
      healthy: 'rgb(220, 252, 231)', warning: 'rgb(254, 243, 199)', danger: 'rgb(254, 226, 226)',
    };
    const ICON_MAIN: Record<string, string> = {
      healthy: 'rgb(22, 163, 74)', warning: 'rgb(217, 119, 6)', danger: 'rgb(220, 38, 38)',
    };
    const TINT_DARK: Record<string, RegExp> = {
      healthy: /^rgba\(22, 163, 74, 0\.1[45]\d*\)$/,
      warning: /^rgba\(217, 119, 6, 0\.1[45]\d*\)$/,
      danger: /^rgba\(220, 38, 38, 0\.1[45]\d*\)$/,
    };

    // Eerste KPI-kaart; lees de semantiek van de chip en toets ertegen (robuust
    // voor welke status de mock ook oplevert).
    const chip = page.locator('[data-testid^="kpi-card-"] [data-semantic]').first();
    await expect(chip).toBeVisible();
    const semantic = (await chip.getAttribute('data-semantic')) as 'healthy' | 'warning' | 'danger';
    expect(['healthy', 'warning', 'danger']).toContain(semantic);

    const icon = chip.locator('svg');

    // Licht: tint-surface bg-*-100 (= de oude *.light exact), icoon -600.
    await expect(chip).toHaveCSS('background-color', TINT_LIGHT[semantic]);
    await expect(icon).toHaveCSS('color', ICON_MAIN[semantic]);

    // Toggle → dark: tint = subtiele 15%-alpha main, icoon ONGEWIJZIGD -600.
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    const darkBg = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg).toMatch(TINT_DARK[semantic]);
    await expect(icon).toHaveCSS('color', ICON_MAIN[semantic]);
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
