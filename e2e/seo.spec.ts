import { expect, test } from './fixtures';

/** What crawlers and no-JS visitors get: the raw prerendered HTML. */
test.describe('SEO and prerendered HTML', () => {
  test('homepage HTML carries title, description, canonical and social tags', async ({
    request,
  }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('<title>NYX — Private fitness club in Worli, Mumbai</title>');
    expect(html).toMatch(
      /<meta name="description" content="NYX is a private fitness club in Worli/,
    );
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+\/"/);
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type']) {
      expect(html, p).toContain(`property="${p}"`);
    }
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('<html lang="en-GB"');
  });

  test('homepage HTML contains the full content (crawlable without JS)', async ({ request }) => {
    const html = await (await request.get('/')).text();
    for (const text of [
      'A quieter',
      'A club, not a crowd.',
      'Room to train. Room to recover.',
      'Coached, not counted.',
      'Membership is by invitation.',
      'Visit the club.',
      'Book a private tour',
    ]) {
      expect(html, text).toContain(text);
    }
  });

  test('HealthClub JSON-LD is valid, with no unfilled tokens', async ({ request }) => {
    const html = await (await request.get('/')).text();
    const raw = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('%NYX_');
    const ld = JSON.parse(raw!);
    expect(ld['@type']).toBe('HealthClub');
    expect(ld.name).toBe('NYX');
    expect(ld.url).toMatch(/^https:\/\//);
    expect(ld.telephone).toMatch(/^\+91\d{10}$/);
    expect(ld.address.addressCountry).toBe('IN');
    expect(ld.geo.latitude).toBeCloseTo(19.0, 0);
    expect(ld.openingHoursSpecification).toHaveLength(2);
  });

  for (const [path, title] of [
    ['/privacy', 'Privacy — NYX'],
    ['/terms', 'Terms — NYX'],
  ]) {
    test(`${path} is prerendered with its own title and canonical`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toMatch(new RegExp(`<link rel="canonical" href="https://[^"]+${path}"`));
    });
  }

  test('robots.txt allows crawling and points to the sitemap', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toMatch(/User-agent: \*/);
    expect(txt).toMatch(/Sitemap: https:\/\/\S+\/sitemap\.xml/);
    expect(txt).not.toContain('%NYX_');
  });

  test('sitemap.xml lists the homepage with a real URL', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toMatch(/<loc>https:\/\/[^<]+\/<\/loc>/);
    expect(xml).not.toContain('%NYX_');
  });

  test('the social share image exists', async ({ request }) => {
    const res = await request.get('/og.png');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the whole homepage is readable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('A quieter');
    await expect(
      page.getByRole('heading', { name: 'Membership is by invitation.' }),
    ).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Visit the club.' })).toBeAttached();
    await expect(page.locator('a[href^="tel:"]').first()).toBeAttached();
  });

  test('the legal pages are readable', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toHaveText('Privacy');
  });
});
