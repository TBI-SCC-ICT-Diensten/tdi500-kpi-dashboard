import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

/**
 * Cluster C2 — kruisprofiel-ToggleGroups (DashboardPage) + Profiel-chips
 * (Dashboard + ContingentDetail) naar de owned primitieven.
 * getComputedStyle-bewijs licht + donker in een EIGEN spec-file (playbook §5;
 * file-disjuncte clusters). De zes kruisprofiel-*-testids zijn het contract.
 */

test.describe('Kruisprofiel-cluster — owned ToggleGroup + merk-Chip', () => {
  test('licht: stock-MUI-look op de items, merk-chip in TNO-blauw', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    const itemA = page.getByTestId('kruisprofiel-isolatie-a');
    await expect(itemA).toBeVisible({ timeout: 15000 });

    // Gemeten stock-metriek: 13px uppercase, py/px 7, selected = rolmap-tint.
    await expect(itemA).toHaveCSS('text-transform', 'uppercase');
    await expect(itemA).toHaveCSS('font-size', '13px');
    await expect(itemA).toHaveCSS('padding-top', '7px');
    const pressed = page.locator('[data-testid^="kruisprofiel-isolatie-"][aria-pressed="true"]');
    await expect(pressed).toHaveCount(1);
    await expect(pressed).toHaveCSS('background-color', 'rgb(226, 232, 240)');
    await expect(pressed).toHaveCSS('color', 'rgb(15, 23, 42)');

    // Beide groepen zijn role=group met aria-label.
    await expect(page.getByRole('group', { name: 'Isolatieniveau' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Afgiftesysteem' })).toBeVisible();

    // Merk-chip: TNO-blauw (rebrand van old-MUI #1E3A5F), pil, 24px.
    const chip = page.getByText(/^Profiel [ABC][123]$/);
    await expect(chip).toHaveCSS('background-color', 'rgb(18, 62, 183)');
    await expect(chip).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(chip).toHaveCSS('height', '24px');
    await expect(chip).toHaveCSS('font-weight', '700');
  });

  test('donker: selectie op overlay-12, chip op primary-400 (J3)', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('kruisprofiel-isolatie-a')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    const pressed = page.locator('[data-testid^="kruisprofiel-isolatie-"][aria-pressed="true"]');
    await expect(pressed).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.12)');
    await expect(pressed).toHaveCSS('color', 'rgb(248, 250, 252)');
    const unpressed = page.locator('[data-testid^="kruisprofiel-isolatie-"][aria-pressed="false"]').first();
    await expect(unpressed).toHaveCSS('color', 'rgb(248, 250, 252)');

    const chip = page.getByText(/^Profiel [ABC][123]$/);
    await expect(chip).toHaveCSS('background-color', 'rgb(108, 143, 232)');
  });

  test('interactie: kruisprofielwissel stuurt de URL en de chip mee (gedrag behouden)', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('kruisprofiel-isolatie-a')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('kruisprofiel-isolatie-a').click();
    await expect(page).toHaveURL(/isolatie=A/);
    await expect(page.getByTestId('kruisprofiel-isolatie-a')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(/^Profiel A[123]$/)).toBeVisible();
    // Null-guard: klik op de al-geselecteerde laat het profiel staan.
    await page.getByTestId('kruisprofiel-isolatie-a').click();
    await expect(page.getByTestId('kruisprofiel-isolatie-a')).toHaveAttribute('aria-pressed', 'true');
  });

  test('contingent-detail: de Profiel-chip is de owned merk-chip (licht + donker)', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('contingent-detail-link').click();
    const chip = page.getByText(/^Profiel [ABC][123]$/);
    await expect(chip).toBeVisible();
    await expect(chip).toHaveCSS('background-color', 'rgb(18, 62, 183)');
    await expect(chip).toHaveCSS('height', '24px');
    await page.getByTestId('theme-toggle').click();
    await expect(chip).toHaveCSS('background-color', 'rgb(108, 143, 232)');
  });
});
