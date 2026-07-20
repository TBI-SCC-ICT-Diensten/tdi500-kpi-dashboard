import { test, expect, type Page } from '@playwright/test';

/**
 * Cluster C3 — BagLookupPage: insulation-chips → owned Chip (solid-status +
 * outlined) en de afgifte-keuze → owned ToggleGroup variant 'pills'.
 * getComputedStyle-bewijs licht + donker (playbook §5), eigen spec-file.
 * De BAG-keten is ge-route-stubd (PDOK + /api/bag-proxy; EP-online 404 →
 * bouwjaar-pad) — deterministisch, geen extern netwerk.
 */

const seedBagRoutes = async (page: Page) => {
  await page.route('**://api.pdok.nl/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        response: {
          docs: [{
            id: 'adr-1',
            weergavenaam: 'Bilderdijkstraat 100, 3027SN Rotterdam',
            straatnaam: 'Bilderdijkstraat',
            huisnummer: '100',
            postcode: '3027SN',
            woonplaatsnaam: 'Rotterdam',
            nummeraanduiding_id: '0599200000305573',
          }],
        },
      }),
    })
  );
  await page.route('**/api/bag*', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        _embedded: {
          adressen: [{
            oorspronkelijkBouwjaar: ['1921'],
            oppervlakte: 70,
            gebruiksdoelen: ['woonfunctie'],
            adresseerbaarObjectGeometrie: { punt: { coordinates: [92294.3, 436830.56] } },
          }],
        },
      }),
    })
  );
  await page.route('**/PandEnergielabel/**', (route) => route.fulfill({ status: 404, body: '' }));
  await page.route('**://api.open-meteo.com/**', (route) => route.fulfill({ status: 404, body: '' }));
};

const doLookup = async (page: Page) => {
  await page.goto('/bag-lookup');
  await page.getByTestId('bag-postcode-input').fill('3027SN');
  await page.getByTestId('bag-huisnummer-input').fill('100');
  await page.getByTestId('bag-submit').click();
  await expect(page.getByText(/^Klasse [ABC]$/)).toBeVisible({ timeout: 15000 });
};

test.describe('BAG-cluster — owned chips + pills-ToggleGroup', () => {
  test('licht: solid-status-chip, outlined-chip met -700 text-safe, pills-metriek', async ({ page }) => {
    await seedBagRoutes(page);
    await doLookup(page);

    // Bouwjaar 1921 → klasse C → seam-solid danger; 2xs-chipmaat.
    const klasse = page.getByText('Klasse C');
    await expect(klasse).toHaveCSS('background-color', 'rgb(220, 38, 38)');
    await expect(klasse).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(klasse).toHaveCSS('height', '24px');

    // Outlined: transparant vlak, -600-rand, -700 tekst (#173 text-safe).
    const conf = page.getByText(/^Betrouwbaarheid:/);
    await expect(conf).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(conf).toHaveCSS('border-top-style', 'solid');
    await expect(conf).toHaveCSS('border-top-width', '1px');

    // Pills: gemeten stock-metriek (48.5px, 14px, radius 8, currentColor-rand).
    const vloer = page.getByRole('button', { name: /vloerverwarming/i });
    await expect(vloer).toHaveCSS('font-size', '14px');
    await expect(vloer).toHaveCSS('border-top-left-radius', '8px');
    await expect(vloer).toHaveCSS('padding-top', '11px');
    await expect(vloer).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('group', { name: 'Afgiftesysteem' })).toBeVisible();
  });

  test('selectie: pill wordt solide TNO-primary (licht) / primary-400 (donker, J3)', async ({ page }) => {
    await seedBagRoutes(page);
    await doLookup(page);

    const vloer = page.getByRole('button', { name: /vloerverwarming/i });
    await vloer.click();
    await expect(vloer).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(0, 0);
    await expect(vloer).toHaveCSS('background-color', 'rgb(18, 62, 183)');
    await expect(vloer).toHaveCSS('color', 'rgb(255, 255, 255)');

    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(vloer).toHaveCSS('background-color', 'rgb(108, 143, 232)');
  });

  test('donker: outlined-chip naar -300 tekst; solid-chip modus-invariant', async ({ page }) => {
    await seedBagRoutes(page);
    await doLookup(page);
    await page.getByTestId('theme-toggle').click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await expect(page.getByText('Klasse C')).toHaveCSS('background-color', 'rgb(220, 38, 38)');
    const conf = page.getByText(/^Betrouwbaarheid:/);
    // De -300-tekststap van de outlined-familie (healthy/warning/danger) of
    // de neutrale slate-tier — welke hangt van de confidence-waarde af.
    const color = await conf.evaluate((el) => getComputedStyle(el).color);
    expect(['rgb(134, 239, 172)', 'rgb(252, 211, 77)', 'rgb(252, 165, 165)', 'rgb(148, 163, 184)']).toContain(color);
  });
});
