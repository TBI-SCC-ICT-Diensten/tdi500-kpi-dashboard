import { test, expect, type Page } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';
import { interceptHupie } from './helpers/hupie';
import { listResponse, detailResponse } from './helpers/sparql';

// A pump "name" in this app is its manufacturer (+ model) — there is no
// dedicated label field. The contingent-pump-card renders it as the prominent
// card title; the dashboard pump-status rows render the manufacturer too.
// Inject an abnormally long one and assert the layout still holds.
const LONG_NAME =
  'Warmtepomp installatie blok C achterzijde tweede verdieping noordvleugel unit 47B reserve';

const pumpUri = (id: string) => `https://www.tno.nl/building/data/tdi500/heatPump-${id}`;

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

test.describe('T5.3 — long names do not break layout (live, intercepted)', () => {
  test('long pump name renders without horizontal overflow on contingent detail', async ({ page }) => {
    const uri = pumpUri('long-name-pump-01');
    await seedBeheerderRole(page);
    await interceptHupie(page, {
      onList: () => listResponse([{ uri, id: 'long-name-pump-01' }]),
      onDetail: () => detailResponse({ uri, cop: 3.2, manufacturer: LONG_NAME }),
    });

    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });

    // Navigate to the contingent detail, where the manufacturer renders as the
    // prominent pump-card title.
    await page.getByTestId('contingent-detail-link').click();
    await expect(page).toHaveURL(/\/contingent\//);

    const card = page.getByTestId('contingent-pump-card').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    // The long name is actually present (handled, not dropped).
    await expect(card).toContainText('noordvleugel unit 47B reserve');

    // The long name is handled (wrapped) without breaking the page layout.
    const overflow = await horizontalOverflow(page);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
