import { test, expect } from '@playwright/test';

/**
 * Cluster C6 — common/Spinner + WeatherWidget: CircularProgress → owned
 * Spinner (LoaderCircle + animate-spin, role=progressbar, TNO text-primary).
 * getComputedStyle-bewijs licht + donker (playbook §5), eigen spec-file.
 * De PDOK-route wordt GESTALD zodat de laadstand deterministisch blijft
 * staan tijdens de meting.
 */

test.describe('Loaders-cluster — owned Spinner', () => {
  test('de BAG-laadstand draait de owned 48px-Spinner in TNO-blauw (licht + donker)', async ({ page }) => {
    // Stall: PDOK antwoordt pas na 15s — de Spinner staat ondertussen vast.
    await page.route('**://api.pdok.nl/**', async (route) => {
      await new Promise((r) => setTimeout(r, 15000));
      await route.fulfill({ status: 504, body: '' });
    });

    await page.goto('/bag-lookup');
    await page.getByTestId('bag-postcode-input').fill('3027SN');
    await page.getByTestId('bag-huisnummer-input').fill('100');
    await page.getByTestId('bag-submit').click();

    const arc = page.getByRole('progressbar');
    await expect(arc).toBeVisible();
    // Owned Spinner: 48px LoaderCircle, spin-animatie, TNO-primary.
    await expect(arc).toHaveAttribute('width', '48');
    await expect(arc).toHaveCSS('animation-name', 'spin');
    await expect(arc).toHaveCSS('color', 'rgb(18, 62, 183)');
    expect(await page.locator('.MuiCircularProgress-root').count()).toBe(0);

    // Donker: de arc volgt de modus-bewuste --primary (J3).
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(arc).toHaveCSS('color', 'rgb(108, 143, 232)');
  });
});
