import { test, expect } from '@playwright/test';
import { seedBeheerderRole } from './helpers/auth';
import { interceptHupie } from './helpers/hupie';

test.describe('API failure handling (live, intercepted)', () => {
  const failureModes = [
    { name: 'T2.2 — 401 invalid credentials', failWith: { status: 401 } },
    { name: 'T4.4 — 500 server error', failWith: { status: 500 } },
    { name: 'T2.3/T2.4 — connection aborted/unreachable', failWith: { abort: true } },
  ];

  for (const mode of failureModes) {
    test(`${mode.name} → error alert shown`, async ({ page }) => {
      await seedBeheerderRole(page);
      await interceptHupie(page, { failWith: mode.failWith });
      await page.goto('/');
      // The dashboard must surface an error, not hang on a spinner or show stale/empty silently.
      await expect(page.getByTestId('error-alert')).toBeVisible({ timeout: 15000 });
    });
  }
});
