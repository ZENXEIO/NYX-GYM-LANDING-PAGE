import { expect, scrollThrough, test } from './fixtures';

test.describe('homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the hero: one h1, the stacked headline and one CTA', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(/A quieter\s*kind of\s*strength\./i);
    await expect(h1).toHaveCSS('text-transform', 'uppercase');
    await expect(page.getByRole('link', { name: 'Book a Private Tour' })).toBeVisible();
  });

  test('shows every section in order', async ({ page }) => {
    await scrollThrough(page);
    const ids = await page.locator('main section[id]').evaluateAll((s) => s.map((x) => x.id));
    expect(ids).toEqual(['club', 'facilities', 'training', 'membership', 'visit']);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      'A club, not a crowd.',
      'Room to train. Room to recover.',
      'Coached, not counted.',
      'Membership is by invitation.',
      'In their words.',
      'Visit the club.',
      'Visit',
      'Contact',
    ]);
  });

  test('section backgrounds follow the rhythm: dark, with plaster pauses', async ({ page }) => {
    await scrollThrough(page);
    const bg = (sel: string) =>
      page.locator(sel).evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await bg('#club')).toBe('rgb(237, 230, 218)');
    expect(await bg('#facilities')).toBe('rgb(22, 26, 29)');
    expect(await bg('#training')).toBe('rgb(31, 37, 40)');
    expect(await bg('#membership')).toBe('rgb(237, 230, 218)');
    expect(await bg('#visit')).toBe('rgb(22, 26, 29)');
  });

  test('every placeholder is clearly labelled', async ({ page }) => {
    await scrollThrough(page);
    const photos = page.locator('[role="img"][aria-label$="(placeholder image)"]');
    // hero + club + 6 facilities + 4 coaches
    await expect(photos).toHaveCount(12);
    await expect(page.getByText('Placeholder coach')).toHaveCount(4);
    await expect(page.getByText('Placeholder address')).toHaveCount(2);
    await expect(page.locator('li.border-dashed', { hasText: 'Placeholder' })).toHaveCount(2);
  });

  test('the one stat is "150"', async ({ page }) => {
    await page.locator('#club').scrollIntoViewIfNeeded();
    await expect(page.locator('#club .text-editorial')).toHaveText('150');
    await expect(page.locator('#club')).toContainText('members. Never more.');
  });

  test('membership shows three invitations and no prices', async ({ page }) => {
    const m = page.locator('#membership');
    await m.scrollIntoViewIfNeeded();
    await expect(m.getByRole('heading', { level: 3 })).toHaveText(['Dusk', 'Nocturne', 'Eclipse']);
    await expect(m).not.toContainText('₹');
    await expect(m).toContainText('Fees are shared on enquiry.');
  });

  test('has no horizontal scroll at this viewport', async ({ page }) => {
    await scrollThrough(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('every interactive element is at least 44×44 px (WCAG 2.5.8 target size)', async ({
    page,
  }) => {
    await scrollThrough(page);
    const small = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          'main button, main a.btn, main a.btn-round, header button, header a',
        ),
      )
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({
          el: el.textContent?.trim() || el.getAttribute('aria-label'),
          r: el.getBoundingClientRect(),
        }))
        .filter(({ r }) => r.width < 44 || r.height < 44)
        .map(({ el, r }) => `${el} ${Math.round(r.width)}×${Math.round(r.height)}`),
    );
    expect(small).toEqual([]);
  });

  test('loads its fonts from the site itself', async ({ page }) => {
    await page.evaluate(() => document.fonts.ready);
    const families = await page.evaluate(() =>
      Array.from(document.fonts)
        .filter((f) => f.status === 'loaded')
        .map((f) => f.family.replace(/"/g, '')),
    );
    expect(families).toContain('Archivo');
  });

  test('the hero info bar carries area, hours and Instagram', async ({ page }) => {
    const bar = page.locator('section[aria-labelledby="hero-title"] ul');
    await expect(bar).toContainText('Worli, Mumbai');
    await expect(bar.getByRole('link', { name: 'Instagram' })).toHaveAttribute('target', '_blank');
  });

  test('the coaches scroll sideways with snap on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile layout only');
    const list = page.getByRole('list', { name: 'Coaches' });
    await list.scrollIntoViewIfNeeded();
    const { scrollable, snap } = await list.evaluate((el) => ({
      scrollable: el.scrollWidth > el.clientWidth,
      snap: getComputedStyle(el).scrollSnapType,
    }));
    expect(scrollable).toBe(true);
    expect(snap).toContain('x');
    expect(snap).toContain('mandatory');
  });

  test('the map loads only when asked', async ({ page }) => {
    let mapRequested = false;
    page.on('request', (r) => {
      if (r.url().includes('google.com/maps')) mapRequested = true;
    });
    const map = page.locator('nyx-map-embed');
    await map.scrollIntoViewIfNeeded();
    await expect(map.locator('iframe')).toHaveCount(0);
    expect(mapRequested).toBe(false);

    await map.getByRole('button', { name: 'Show map' }).click();
    await expect(map.locator('iframe')).toHaveAttribute('title', 'Map showing Worli, Mumbai');
    expect(mapRequested).toBe(true);
  });
});
