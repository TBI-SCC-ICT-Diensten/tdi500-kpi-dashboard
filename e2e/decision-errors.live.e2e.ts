import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';
import { interceptHupie } from './helpers/hupie';
import { listResponse, detailResponseWithErrors } from './helpers/sparql';

test.describe('Decision / error codes (live, intercepted)', () => {
  test('T7.5 — pump carrying multiple error codes renders error badges on contingent detail', async ({ page }) => {
    const uri = 'https://www.tno.nl/building/data/tdi500/heatPump-e2e-errors';

    await seedBeheerderRole(page);
    await interceptHupie(page, {
      onList: () => listResponse([{ uri, id: 'e2e-errors' }]),
      onDetail: () =>
        detailResponseWithErrors(uri, [
          { code: 'W042', message: 'Waarschuwing', severity: 'warning' },
          { code: 'F101', message: 'Hoge prioriteit', severity: 'high' },
          { code: 'F042', message: 'Kritieke storing', severity: 'critical' },
        ]),
    });

    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });

    // Navigate to the contingent detail page where per-pump error codes render.
    await page.getByTestId('contingent-detail-link').click();
    await expect(page).toHaveURL(/\/contingent\//);

    // The injected pump carries 3 error codes → error badges render.
    const badges = page.getByTestId('pump-error-code');
    await expect(badges.first()).toBeVisible({ timeout: 10000 });
    expect(await badges.count()).toBeGreaterThan(0);
  });
});
