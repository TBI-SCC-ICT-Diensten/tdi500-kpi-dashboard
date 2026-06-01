import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';
import { interceptHupie } from './helpers/hupie';
import { listResponse, detailResponse } from './helpers/sparql';

const pumpUri = (id: string) => `https://www.tno.nl/building/data/tdi500/heatPump-${id}`;

test.describe('Edge data scenarios (live, intercepted)', () => {
  test('T6.3 — empty pump list shows empty state', async ({ page }) => {
    await seedBeheerderRole(page);
    await interceptHupie(page, {
      onList: () => listResponse([]),
    });
    await page.goto('/');
    await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 15000 });
  });

  test('T6.2 — single data point renders one pump without breaking', async ({ page }) => {
    const uri = pumpUri('single-pump-01');
    await seedBeheerderRole(page);
    await interceptHupie(page, {
      onList: () => listResponse([{ uri, id: 'single-pump-01' }]),
      onDetail: () => detailResponse({ uri, cop: 3.2 }),
    });
    await page.goto('/');
    // Dashboard resolves (not stuck spinner, not empty-state)
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });
    // Navigate to contingent detail, assert exactly one pump card
    await page.getByTestId('contingent-detail-link').click();
    await expect(page).toHaveURL(/\/contingent\//);
    const pumpCards = page.getByTestId('contingent-pump-card');
    await expect(pumpCards.first()).toBeVisible({ timeout: 10000 });
    expect(await pumpCards.count()).toBe(1);
  });

  test('T6.4 — extreme COP value renders without crashing', async ({ page }) => {
    const uri = pumpUri('extreme-pump-01');
    await seedBeheerderRole(page);
    await interceptHupie(page, {
      onList: () => listResponse([{ uri, id: 'extreme-pump-01' }]),
      onDetail: () => detailResponse({ uri, cop: 99 }),
    });
    await page.goto('/');
    // The app renders the dashboard with an extreme COP without crashing —
    // the COP gauge and decision card are present
    await expect(page.getByTestId('cop-gauge')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('decision-card')).toBeVisible();
  });
});
