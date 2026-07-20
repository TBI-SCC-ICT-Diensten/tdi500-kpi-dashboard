import { test, expect, type Page } from '@playwright/test';

/**
 * Cluster C7 — AanbevolenInstellingen: MUI Tooltip → native title op de
 * bestaande span-wrapper (ErrorCodeRow-precedent). Geen visuele delta te
 * meten (de tooltip is voortaan de native browser-title); dit bewijst het
 * attribuut-contract in de echte flow. BAG-keten ge-route-stubd (C3-patroon).
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

test.describe('AanbevolenInstellingen-cluster — native title', () => {
  test('de Toepassen-knop draagt de native title op de span; knop blijft disabled', async ({ page }) => {
    await seedBagRoutes(page);
    await page.goto('/bag-lookup');
    await page.getByTestId('bag-postcode-input').fill('3027SN');
    await page.getByTestId('bag-huisnummer-input').fill('100');
    await page.getByTestId('bag-submit').click();
    await expect(page.getByText(/^Klasse [ABC]$/)).toBeVisible({ timeout: 15000 });

    // Afgifte kiezen → de aanbevolen-instellingen-sectie rendert.
    await page.getByRole('button', { name: /vloerverwarming/i }).click();
    const btn = page.getByRole('button', { name: /toepassen op warmtepomp/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();

    const wrapper = page.locator('span[title*="In ontwikkeling"]');
    await expect(wrapper).toHaveCount(1);
    // Geen MUI-Tooltip-machinerie meer rond de knop.
    expect(await page.locator('.MuiTooltip-popper').count()).toBe(0);
  });
});
