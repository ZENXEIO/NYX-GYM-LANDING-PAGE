import { expect, scrollThrough, test } from './fixtures';

/**
 * Visual regression (@visual project only: `npm run e2e:visual`).
 * Baselines live in e2e/visual.spec.ts-snapshots/. After an intended design
 * change, review the diff in the HTML report, then `npm run e2e:visual -- -u`.
 * Reduced motion is on, so every screenshot is taken at rest.
 */
const sections = ['hero', 'club', 'facilities', 'training', 'membership', 'visit'] as const;

for (const width of [375, 1440]) {
  test.describe(`${width}px @visual`, () => {
    test.use({ viewport: { width, height: width === 375 ? 812 : 900 } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await scrollThrough(page);
    });

    for (const name of sections) {
      test(`${name} @visual`, async ({ page }) => {
        const target =
          name === 'hero'
            ? page.locator('section[aria-labelledby="hero-title"]')
            : page.locator(`#${name}`);
        await target.scrollIntoViewIfNeeded();
        await expect(target).toHaveScreenshot(`${name}-${width}.png`, {
          // The capsule is fixed and would float over each section.
          mask: [page.locator('nyx-header')],
        });
      });
    }

    test(`menu open @visual`, async ({ page }) => {
      await page.locator('button[aria-controls="site-menu"]').click();
      await expect(page).toHaveScreenshot(`menu-${width}.png`);
    });

    test(`form errors @visual`, async ({ page }) => {
      await page.locator('#tour-name').scrollIntoViewIfNeeded();
      await expect(page.locator('#tour-date')).toHaveAttribute('min', /\d/);
      await page.getByRole('button', { name: 'Send request' }).click();
      await expect(page.locator('nyx-tour-form')).toHaveScreenshot(`form-errors-${width}.png`, {
        mask: [page.locator('#tour-date')], // today's date differs per run
      });
    });
  });
}
