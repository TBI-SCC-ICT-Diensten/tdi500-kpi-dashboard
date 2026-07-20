import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

/**
 * Cluster C4 — HeatPumpCommandPanel: MUI Collapse → owned Collapsible
 * (grid-rows 0fr→1fr), chevron-IconButton → decoratief icoon-span,
 * CircularProgress → owned Spinner. getComputedStyle-bewijs licht + donker
 * (playbook §5), eigen spec-file. Gemeten pariteit: dicht 0px / open 480px,
 * chevron-box 30x30 — byte-identiek aan MUI.
 */

test.describe('CommandPanel-cluster — Collapsible + icoonspan', () => {
  test('accordion: dicht 0px, open op inhoudshoogte, grid-rows-transitie actief', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('contingent-detail-link')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('contingent-detail-link').click();

    const collapsible = page.getByTestId('command-collapsible').first();
    await expect(collapsible).toBeAttached();
    // Dicht: hoogte 0 via 0fr; de transitie staat op grid-template-rows.
    await expect
      .poll(async () => (await collapsible.boundingBox())?.height ?? -1)
      .toBe(0);
    await expect(collapsible).toHaveCSS('transition-property', 'grid-template-rows');
    await expect(collapsible).toHaveCSS('transition-duration', '0.3s');

    // Open via de RIJ (het kliktarget) — inhoud verschijnt op volle hoogte.
    await page.getByText('Inregelinstellingen', { exact: true }).first().click();
    await expect
      .poll(async () => (await collapsible.boundingBox())?.height ?? -1)
      .toBeGreaterThan(300);
    await expect(page.getByText(/temperatuur setpoint/i).first()).toBeVisible();

    // Weer dicht: terug naar 0 (en de inhoud verdwijnt uit beeld).
    await page.getByText('Inregelinstellingen', { exact: true }).first().click();
    await expect
      .poll(async () => (await collapsible.boundingBox())?.height ?? -1)
      .toBe(0);
  });

  test('chevron: decoratief span (geen dode button), rolmap-kleur licht + donker', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('contingent-detail-link')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('contingent-detail-link').click();

    const chevron = page.locator('[data-chevron]').first();
    await expect(chevron).toBeVisible();
    const tag = await chevron.evaluate((el) => el.tagName);
    expect(tag).toBe('SPAN');
    await expect(chevron).toHaveAttribute('aria-hidden', 'true');
    await expect(chevron).toHaveCSS('color', 'rgb(71, 85, 105)');

    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(chevron).toHaveCSS('color', 'rgb(148, 163, 184)');

    // Geen MUI-restanten van dit cluster BINNEN het paneel (de nog-MUI
    // Collapse/IconButton van HeatPumpDetailCard — cluster C5 — staat op
    // dezelfde pagina en blijft hier bewust buiten beschouwing).
    const panel = page.locator('[data-testid="command-collapsible"]').first().locator('..');
    expect(await panel.locator('.MuiCollapse-root, .MuiIconButton-root, .MuiCircularProgress-root').count()).toBe(0);
  });
});
