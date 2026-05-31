import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';

const IPAD_PORTRAIT = { width: 768, height: 1024 };

async function hasHorizontalOverflow(page: import('@playwright/test').Page): Promise<number> {
  return page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
}

test.describe('Responsive — no horizontal overflow at iPad portrait (768px)', () => {
  test.use({ viewport: IPAD_PORTRAIT });

  test('T5.2 — contingent detail has no horizontal overflow at 768px', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('contingent-detail-link').click();
    await expect(page).toHaveURL(/\/contingent\//);
    await expect(page.getByTestId('contingent-pump-card').first()).toBeVisible({ timeout: 10000 });
    const overflow = await hasHorizontalOverflow(page);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('T5.2 — dashboard has no horizontal overflow at 768px', async ({ page }) => {
    await seedBeheerderRole(page);
    await page.goto('/');
    await expect(page.getByTestId('decision-card')).toBeVisible({ timeout: 15000 });
    const overflow = await hasHorizontalOverflow(page);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('T5.2 — BAG lookup has no horizontal overflow at 768px', async ({ page }) => {
    // BAG lookup is the installateur landing; navigate directly
    await page.goto('/bag-lookup');
    await expect(page.getByTestId('bag-postcode-input')).toBeVisible({ timeout: 15000 });
    const overflow = await hasHorizontalOverflow(page);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
