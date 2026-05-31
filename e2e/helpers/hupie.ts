import type { Page, Route } from '@playwright/test';

type HupieHandlers = {
  // Return the response body (object) for the list query, or null to use a default empty list.
  onList?: () => unknown;
  // Return the response body (object) for a detail query, or null.
  onDetail?: (postData: string) => unknown;
  // If set, fail ALL hupie requests this way instead of fulfilling.
  failWith?: { status?: number; abort?: boolean };
};

/**
 * Installs interception for all Hupie /hupie/query/ requests.
 * Branches list vs detail on the SPARQL body (detail has 'VALUES ?id').
 * Call BEFORE page.goto so the app's first request is intercepted.
 */
export async function interceptHupie(page: Page, handlers: HupieHandlers): Promise<void> {
  await page.route('**/hupie/query/**', async (route: Route) => {
    if (handlers.failWith?.abort) {
      await route.abort('failed');
      return;
    }
    if (handlers.failWith?.status) {
      await route.fulfill({ status: handlers.failWith.status, contentType: 'application/json', body: '{}' });
      return;
    }
    const postData = route.request().postData() ?? '';
    const isDetail = postData.includes('VALUES ?id');
    const body = isDetail
      ? (handlers.onDetail?.(postData) ?? { head: { vars: [] }, results: { bindings: [] } })
      : (handlers.onList?.() ?? { head: { vars: ['heatpump', 'id'] }, results: { bindings: [] } });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}
