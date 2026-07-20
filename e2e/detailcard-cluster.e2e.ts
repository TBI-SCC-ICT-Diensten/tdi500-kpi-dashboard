import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

/**
 * Cluster C5 — HeatPumpDetailCard's Apparaatinformatie-accordion: MUI
 * Collapse → owned Collapsible, chevron-IconButton → decoratief icoon-span
 * (C4-patroon). getComputedStyle-bewijs licht + donker, eigen spec-file.
 */

test.describe('DetailCard-cluster — specs-accordion', () => {
  test('accordion: dicht 0px, open op inhoudshoogte, rij is het kliktarget', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('contingent-detail-link')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('contingent-detail-link').click();

    const specs = page.getByTestId('specs-collapsible').first();
    await expect(specs).toBeAttached();
    await expect
      .poll(async () => (await specs.boundingBox())?.height ?? -1)
      .toBe(0);
    await expect(specs).toHaveCSS('transition-property', 'grid-template-rows');

    await page.getByText('Apparaatinformatie', { exact: true }).first().click();
    await expect
      .poll(async () => (await specs.boundingBox())?.height ?? -1)
      .toBeGreaterThan(60);
    await expect(page.getByText('Fabrikant').first()).toBeVisible();

    await page.getByText('Apparaatinformatie', { exact: true }).first().click();
    await expect
      .poll(async () => (await specs.boundingBox())?.height ?? -1)
      .toBe(0);
  });

  test('chevron-span: aria-hidden, 30px-box, rolmap-kleur licht + donker', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('contingent-detail-link')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('contingent-detail-link').click();

    // Scope naar de specs-kaart: het paneel-chevron (C4) staat ook op de pagina.
    const card = page.getByTestId('specs-collapsible').first().locator('..');
    const chevron = card.locator('[data-chevron]').first();
    await expect(chevron).toBeVisible();
    await expect(chevron).toHaveAttribute('aria-hidden', 'true');
    const box = await chevron.boundingBox();
    expect(Math.round(box!.width)).toBe(30);
    expect(Math.round(box!.height)).toBe(30);
    await expect(chevron).toHaveCSS('color', 'rgb(71, 85, 105)');

    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(chevron).toHaveCSS('color', 'rgb(148, 163, 184)');

    expect(await card.locator('.MuiCollapse-root, .MuiIconButton-root').count()).toBe(0);
  });
});
