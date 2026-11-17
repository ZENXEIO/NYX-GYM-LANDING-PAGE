import { Page, Route, expect, test as base } from '@playwright/test';

/** Must match scripts/e2e-build.mjs. */
export const TOUR_ENDPOINT = 'https://forms.nyx.test/tour';

export interface TourCall {
  body: Record<string, unknown>;
  headers: Record<string, string>;
}

/**
 * Every test: fails on console errors and uncaught exceptions (hydration
 * mismatches are reported as console errors), and blocks real third-party
 * requests so no test ever reaches the internet.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort('blockedbyclient'));
      await use(errors);
      // Blocked third-party requests log a net error; ignore only those.
      const real = errors.filter((e) => !/ERR_BLOCKED_BY_CLIENT|Failed to load resource/.test(e));
      expect(real, 'console errors').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** Intercept the tour endpoint. `reply` decides the response for each call. */
export async function mockTour(
  page: Page,
  reply: (
    call: TourCall,
    n: number,
  ) => Promise<void | { status: number; body?: unknown }> | { status: number; body?: unknown },
): Promise<TourCall[]> {
  const calls: TourCall[] = [];
  await page.route(TOUR_ENDPOINT, async (route: Route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders() });
    }
    const call = { body: req.postDataJSON() as Record<string, unknown>, headers: req.headers() };
    calls.push(call);
    const r = await reply(call, calls.length);
    if (!r) return; // the handler left the request hanging (timeout tests)
    await route.fulfill({
      status: r.status,
      contentType: 'application/json',
      headers: corsHeaders(),
      body: JSON.stringify(r.body ?? {}),
    });
  });
  return calls;
}

function corsHeaders(): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, idempotency-key',
    'access-control-allow-methods': 'POST, OPTIONS',
  };
}

/** Scroll to the tour form and wait until it has hydrated (min date is set client-side). */
export async function openTourForm(page: Page): Promise<void> {
  await page.goto('/#visit');
  await page.locator('#tour-name').scrollIntoViewIfNeeded();
  await expect(page.locator('#tour-date')).toHaveAttribute('min', /^\d{4}-\d{2}-\d{2}$/);
}

export function isoInDays(days: number): string {
  const d = new Date(Date.now() + days * 864e5);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

export async function fillTourForm(
  page: Page,
  over: Partial<{ name: string; phone: string; email: string; date: string; slot: string }> = {},
): Promise<void> {
  await page.getByLabel('Name').fill(over.name ?? 'Asha Rao');
  await page.getByLabel('Mobile').fill(over.phone ?? '+91 98200-12345');
  await page.getByLabel('Email').fill(over.email ?? 'asha@example.com');
  await page.getByLabel('Preferred date').fill(over.date ?? isoInDays(3));
  await page.getByRole('radio', { name: over.slot ?? 'Evening' }).check({ force: true });
}

/** Scroll the whole page so every @defer (on viewport) block renders and hydrates. */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
}
