import { test, expect } from '@playwright/test';

/**
 * Cluster C1 — Header-shell naar flat <header> + owned primitieven (Chip,
 * ToggleGroup, ghost-icon-Buttons). getComputedStyle-bewijs licht + donker
 * (playbook §5) in een EIGEN spec-file (geen gedeelde edits aan
 * dark-mode.e2e.ts — file-disjuncte clusters). Contract-behoud: de
 * datasource-chip/theme-toggle/role-*-testids en de aria's blijven de
 * stabiele selectors.
 */

test.describe('Header-cluster — flat shell + owned primitieven', () => {
  test('licht: header-vlak, interactieve chip, segmented rolselectie', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByTestId('datasource-chip');
    await expect(chip).toBeVisible();

    // Flat shell: bg-card + alleen een onderrand (1px solid --border; de
    // border-0-regel — zonder die klasse materialiseert de UA-'medium' 3px).
    const header = page.locator('header');
    await expect(header).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(header).toHaveCSS('border-bottom-width', '1px');
    await expect(header).toHaveCSS('border-bottom-style', 'solid');
    await expect(header).toHaveCSS('border-top-width', '0px');
    const toolbar = header.locator('> div');
    await expect(toolbar).toHaveCSS('min-height', '64px');

    // Interactieve chip: ECHTE button, seam-solid warning (mock-modus),
    // modus-invariant, pilvorm.
    await expect(chip).toHaveText('Mock data');
    const chipTag = await chip.evaluate((el) => el.tagName);
    expect(chipTag).toBe('BUTTON');
    await expect(chip).toHaveCSS('background-color', 'rgb(217, 119, 6)');
    await expect(chip).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(chip).toHaveCSS('cursor', 'pointer');
    await expect(chip).toHaveCSS('height', '24px');

    // Rolselectie: role=group + aria-pressed; geselecteerd = TNO-blauw op het
    // action.selected-tintvlak (rolmap slate-200).
    await expect(page.getByRole('group', { name: 'Rolselectie' })).toBeVisible();
    const pressed = page.locator('[data-testid^="role-"][aria-pressed="true"]');
    await expect(pressed).toHaveCount(1);
    await expect(pressed).toHaveCSS('background-color', 'rgb(226, 232, 240)');
    await expect(pressed).toHaveCSS('color', 'rgb(18, 62, 183)');
    await expect(pressed).toHaveCSS('border-top-left-radius', '4px');

    // Theme-knop: 30px rond, native title i.p.v. MUI Tooltip.
    const themeBtn = page.getByTestId('theme-toggle');
    await expect(themeBtn).toHaveCSS('width', '30px');
    await expect(themeBtn).toHaveCSS('height', '30px');
    await expect(themeBtn).toHaveAttribute('title', 'Donker thema');
    await expect(themeBtn).toHaveAttribute('aria-label', 'Thema wisselen');
  });

  test('donker: chip modus-invariant, selectie op overlay-12 + primary-400, header slate-800', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('datasource-chip')).toBeVisible();

    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // toHaveCSS pollt — de transition-colors (150ms) loopt binnen de poll uit.
    const header = page.locator('header');
    await expect(header).toHaveCSS('background-color', 'rgb(30, 41, 59)');

    const chip = page.getByTestId('datasource-chip');
    await expect(chip).toHaveCSS('background-color', 'rgb(217, 119, 6)');

    const pressed = page.locator('[data-testid^="role-"][aria-pressed="true"]');
    await expect(pressed).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.12)');
    await expect(pressed).toHaveCSS('color', 'rgb(108, 143, 232)');

    // Title wisselt mee (native title vervangt de MUI Tooltip).
    await expect(page.getByTestId('theme-toggle')).toHaveAttribute('title', 'Licht thema');
  });

  test('chip-klik toggelt de databron (interactiviteit behouden)', async ({ page }) => {
    await page.goto('/');
    const chip = page.getByTestId('datasource-chip');
    await expect(chip).toHaveText('Mock data');
    await chip.click();
    await expect(chip).toHaveText('Hupie API (live)');
    // Muis weg van de chip: de interactieve hover (bg-success-700) is anders
    // de gemeten kleur — de rustkleur is de seam-solid -600.
    await page.mouse.move(0, 0);
    await expect(chip).toHaveCSS('background-color', 'rgb(22, 163, 74)');
    await chip.click();
    await expect(chip).toHaveText('Mock data');
  });

  test('rol-toggle: klik wisselt aria-pressed; klik op geselecteerde deselecteert NIET', async ({ page }) => {
    await page.goto('/');
    const installateur = page.getByTestId('role-installateur');
    const beheerder = page.getByTestId('role-beheerder');
    await expect(installateur).toBeVisible();
    const startPressed = (await installateur.getAttribute('aria-pressed')) === 'true' ? installateur : beheerder;
    const other = startPressed === installateur ? beheerder : installateur;
    await other.click();
    await expect(other).toHaveAttribute('aria-pressed', 'true');
    await expect(startPressed).toHaveAttribute('aria-pressed', 'false');
    // MUI-exclusive-guard: klik op de al-geselecteerde laat de selectie staan.
    await other.click();
    await expect(other).toHaveAttribute('aria-pressed', 'true');
  });

  test('responsive: hamburger 40px rond onder md (900, C0-breakpoints), weg erboven', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await page.goto('/');
    const menuBtn = page.getByLabel('menu');
    await expect(menuBtn).toBeVisible();
    await expect(menuBtn).toHaveCSS('width', '40px');
    await expect(menuBtn).toHaveCSS('height', '40px');
    await expect(menuBtn).toHaveCSS('border-radius', '9999px');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(menuBtn).toBeHidden();
  });
});
