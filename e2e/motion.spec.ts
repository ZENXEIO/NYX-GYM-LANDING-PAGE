import { expect, test } from './fixtures';

const heroAnimations = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('.hero-line, .hero-media, .hero-late')).map(
      (el) => getComputedStyle(el).animationName,
    ),
  );

test.describe('motion', () => {
  test('hero load: headline lines rise with short delays, the arc draws once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const names = await heroAnimations(page);
    expect(names.every((n) => n !== 'none')).toBe(true);
    const delays = await page
      .locator('.hero-line')
      .evaluateAll((ls) => ls.map((l) => getComputedStyle(l).animationDelay));
    expect(delays).toEqual(['0.08s', '0.2s', '0.32s']);
    const arc = await page
      .locator('svg.arc-draw path')
      .evaluate((p) => getComputedStyle(p).animationIterationCount);
    expect(arc).toBe('1');
  });

  test('the embossed monogram never animates (it is often the LCP element)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const name = await page
      .locator('.hero-monogram')
      .evaluate((e) => getComputedStyle(e).animationName);
    expect(name).toBe('none');
  });

  test('motion is calm: no animation or transition shorter than 600 ms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const fast = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .flatMap((el) => {
          // The skip link must appear at once when focused: a slow fade would hurt keyboard users.
          if (el.classList.contains('skip-link')) return [];
          const s = getComputedStyle(el);
          const toMs = (v: string) =>
            v.split(',').map((x) => parseFloat(x) * (x.trim().endsWith('ms') ? 1 : 1000));
          return [...toMs(s.animationDuration), ...toMs(s.transitionDuration)]
            .filter((ms) => ms > 0 && ms < 600)
            .map((ms) => `${el.tagName.toLowerCase()}.${el.className} ${ms}ms`);
        })
        .slice(0, 10),
    );
    expect(fast).toEqual([]);
  });

  test.describe('prefers-reduced-motion: reduce', () => {
    // reducedMotion is a context option in this Playwright version, not a top-level one.
    test.use({ contextOptions: { reducedMotion: 'reduce' } });

    test('turns off every hero animation and shows content at once', async ({ page }) => {
      await page.goto('/');
      expect((await heroAnimations(page)).every((n) => n === 'none')).toBe(true);
      await expect(page.locator('h1')).toHaveCSS('opacity', '1');
      await expect(page.getByRole('link', { name: 'Book a Private Tour' })).toBeVisible();
    });

    test('no photo reveal, parallax or text fade anywhere on the page', async ({ page }) => {
      await page.goto('/');
      const animated = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll('.photo-reveal, .parallax, .text-reveal, .reveal-pending'),
        )
          .filter(
            (el) =>
              getComputedStyle(el).animationName !== 'none' || getComputedStyle(el).opacity !== '1',
          )
          .map((el) => el.className),
      );
      expect(animated).toEqual([]);
    });

    test('photos do not scale on hover', async ({ page, isMobile }) => {
      test.skip(isMobile, 'no hover on touch');
      await page.goto('/#facilities');
      const fig = page.locator('#facilities figure').first();
      await fig.hover();
      const transform = await fig
        .locator('nyx-photo')
        .evaluate((e) => getComputedStyle(e).transform);
      expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
    });

    test('the menu opens without animation', async ({ page }) => {
      await page.goto('/');
      await page.locator('button[aria-controls="site-menu"]').click();
      const name = await page
        .locator('#site-menu')
        .evaluate((e) => getComputedStyle(e).animationName);
      expect(name).toBe('none');
    });
  });
});
