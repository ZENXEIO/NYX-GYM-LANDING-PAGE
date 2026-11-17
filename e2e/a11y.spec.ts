import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';
import { expect, mockTour, openTourForm, scrollThrough, test } from './fixtures';

/** WCAG 2.2 A + AA, on the fully rendered page. */
async function axe(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
  ]);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  return violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
}

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  test('homepage: zero violations on dark and plaster sections', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    expect(await axe(page)).toEqual([]);
  });

  for (const id of ['club', 'membership']) {
    test(`plaster section #${id}: zero violations (bronze-deep, ink-muted)`, async ({ page }) => {
      await page.goto(`/#${id}`);
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(await axe(page, `#${id}`)).toEqual([]);
    });
  }

  test('menu open: zero violations', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-controls="site-menu"]').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await axe(page)).toEqual([]);
  });

  test('form with every error showing: zero violations', async ({ page }) => {
    await openTourForm(page);
    await page.getByRole('button', { name: 'Send request' }).click();
    await expect(page.locator('form .error')).toHaveCount(5);
    expect(await axe(page, '#visit')).toEqual([]);
  });

  test('form fallback alert: zero violations', async ({ page }) => {
    await mockTour(page, () => ({ status: 429 }));
    await openTourForm(page);
    await page.getByLabel('Name').fill('Asha Rao');
    await page.getByLabel('Mobile').fill('9820012345');
    await page.getByLabel('Email').fill('asha@example.com');
    await page.getByLabel('Preferred date').fill('2099-01-01');
    await page.getByRole('radio', { name: 'Morning' }).check({ force: true });
    await page.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    expect(await axe(page, '#visit')).toEqual([]);
  });

  test('form success message: zero violations', async ({ page }) => {
    await mockTour(page, () => ({ status: 201 }));
    await openTourForm(page);
    await page.getByLabel('Name').fill('Asha Rao');
    await page.getByLabel('Mobile').fill('9820012345');
    await page.getByLabel('Email').fill('asha@example.com');
    await page.getByLabel('Preferred date').fill('2099-01-01');
    await page.getByRole('radio', { name: 'Morning' }).check({ force: true });
    await page.getByRole('button', { name: 'Send request' }).click();
    await expect(page.getByRole('status')).toBeVisible();
    expect(await axe(page, '#visit')).toEqual([]);
  });

  test('map loaded: zero violations', async ({ page }) => {
    await page.goto('/#visit');
    await page.locator('nyx-map-embed button').click();
    expect(await axe(page, 'nyx-map-embed')).toEqual([]);
  });

  for (const path of ['/privacy', '/terms']) {
    test(`${path}: zero violations`, async ({ page }) => {
      await page.goto(path);
      expect(await axe(page)).toEqual([]);
    });
  }

  test('landmarks: one banner, one main, one contentinfo, labelled nav', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(1);
  });

  test('heading order never skips a level', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    const levels = await page
      .locator('h1, h2, h3, h4')
      .evaluateAll((hs) =>
        hs
          .filter((h) => (h as HTMLElement).offsetParent !== null || h.closest('dialog') === null)
          .map((h) => Number(h.tagName[1])),
      );
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i++)
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  });

  test('page text stays readable at 200% zoom (no horizontal scroll at 320 CSS px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto('/');
    await scrollThrough(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
