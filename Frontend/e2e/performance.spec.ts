import { expect, scrollThrough, test } from './fixtures';

/**
 * Cheap, deterministic guards for the budgets in CLAUDE.md §8. Lighthouse CI
 * (npm run lhci) measures the real numbers; these catch regressions in CI.
 */
test.describe('performance guards', () => {
  test('first load makes no third-party requests', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith('http://localhost')) external.push(r.url());
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(external).toEqual([]);
  });

  test('the two fonts are preloaded and nothing else blocks rendering', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html.match(/<link rel="preload"[^>]+as="font"/g)).toHaveLength(2);
    expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    // At most one render-blocking stylesheet. Angular also emits a <noscript> fallback
    // and may load the full sheet with media="print" (non-blocking); neither counts.
    const live = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
    const blocking = live.match(/<link rel="stylesheet"(?![^>]*media="print")[^>]*>/g) ?? [];
    expect(blocking.length).toBeLessThanOrEqual(1);
    // Every script is a module (deferred by default).
    const classic = (
      html.match(/<script(?![^>]*type="(module|application\/ld\+json)")[^>]*src=/g) ?? []
    ).length;
    expect(classic).toBe(0);
  });

  test('initial JavaScript stays under the 130 KB (gzip) budget', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // encodedBodySize is the compressed size on the wire (serve gzips), which is
    // what the budget means. Response bodies in Playwright are already decompressed.
    const bytes = await page.evaluate(() =>
      (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
        .filter((e) => e.initiatorType === 'script' || e.name.endsWith('.js'))
        .reduce((sum, e) => sum + e.encodedBodySize, 0),
    );
    expect(bytes).toBeGreaterThan(0);
    expect(bytes / 1024).toBeLessThan(130);
  });

  test('layout does not shift while the page loads and scrolls (CLS ≤ 0.05)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await scrollThrough(page);
    await page.waitForTimeout(500);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThanOrEqual(0.05);
  });

  test('below-the-fold sections hydrate only when scrolled to (incremental hydration)', async ({
    page,
  }) => {
    const chunks = new Set<string>();
    page.on('request', (r) => {
      if (r.resourceType() === 'script') chunks.add(r.url());
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    const atTop = chunks.size;
    await scrollThrough(page);
    await page.waitForLoadState('networkidle');
    expect(chunks.size).toBeGreaterThan(atTop);
  });

  test('hashed assets are served with immutable caching rules in _headers', async ({ request }) => {
    // serve ignores _headers; check the file Cloudflare Pages will apply.
    const res = await request.get('/_headers');
    test.skip(res.status() !== 200, 'serve does not expose _headers');
    const headers = await res.text();
    expect(headers).toMatch(/\/\*\.js\s+Cache-Control: public, max-age=31536000, immutable/);
  });
});
