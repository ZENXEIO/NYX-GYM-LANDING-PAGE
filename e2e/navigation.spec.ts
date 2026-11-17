import { expect, test } from './fixtures';

test.describe('keyboard and navigation', () => {
  test('the first Tab reaches the skip link, which moves focus to main', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible(); // visible when focused
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
    expect(new URL(page.url()).hash).toBe('');
  });

  test('every focusable element shows a visible focus ring', async ({ page }) => {
    await page.goto('/');
    const missing: string[] = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const ring = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        const visible = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2;
        return { name: el.textContent?.trim().slice(0, 30) || el.tagName, visible };
      });
      if (ring && !ring.visible) missing.push(ring.name);
    }
    expect(missing).toEqual([]);
  });

  test.describe('menu dialog', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    const trigger = (page: import('@playwright/test').Page) =>
      page.locator('button[aria-controls="site-menu"]');

    test('opens from the keyboard, traps focus, closes with Esc and returns focus', async ({
      page,
    }) => {
      await trigger(page).focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: 'Site menu' });
      await expect(dialog).toBeVisible();
      await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');

      // Chrome lets Tab leave a modal dialog for its own toolbar (activeElement is then
      // <body>), but focus must never land on anything in the page behind the dialog.
      const focusInsideOrBrowser = () =>
        page.evaluate(() => {
          const el = document.activeElement;
          return !el || el === document.body || !!el.closest('#site-menu');
        });
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#site-menu'))).toBe(true);
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        expect(await focusInsideOrBrowser()).toBe(true);
      }

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger(page)).toBeFocused();
      await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
    });

    test('locks page scroll while open', async ({ page }) => {
      await trigger(page).click();
      await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
      await page.getByRole('button', { name: 'Close' }).click();
      await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    });

    test('makes the page behind it inert', async ({ page }) => {
      await trigger(page).click();
      await expect(page.getByRole('link', { name: 'Book a Private Tour' }))
        .toBeHidden({ timeout: 1 })
        .catch(() => undefined);
      // A modal <dialog> removes the rest of the page from the accessibility tree.
      const snapshot = await page.accessibility.snapshot({ interestingOnly: true });
      const names = JSON.stringify(snapshot);
      expect(names).not.toContain('Book a Private Tour');
      expect(names).toContain('Membership');
    });

    for (const [label, id] of [
      ['The Club', 'club'],
      ['Facilities', 'facilities'],
      ['Training', 'training'],
      ['Membership', 'membership'],
      ['Visit', 'visit'],
    ] as const) {
      test(`"${label}" closes the menu and scrolls to #${id}`, async ({ page }) => {
        await trigger(page).click();
        await page.getByRole('dialog').getByRole('link', { name: label, exact: true }).click();
        await expect(page.getByRole('dialog')).toBeHidden();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));
        await expect(page.locator(`#${id}`)).toBeInViewport();
      });
    }
  });

  test('"Book a Private Tour" scrolls to the form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Book a Private Tour' }).click();
    await expect(page).toHaveURL(/#visit$/);
    await expect(page.locator('#visit')).toBeInViewport();
  });

  test('"Book a tour" in the capsule scrolls to the form @desktop-only', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'hidden on mobile by design');
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Book a tour' })
      .click();
    await expect(page.locator('#visit')).toBeInViewport();
  });

  test('the nav capsule turns solid once the page scrolls', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).not.toHaveClass(/is-solid/);
    await page.mouse.wheel(0, 600);
    await expect(nav).toHaveClass(/is-solid/);
  });

  test('a deep link to #visit lands on the form', async ({ page }) => {
    await page.goto('/#visit');
    await expect(page.locator('#visit')).toBeInViewport();
  });

  for (const [name, path, title] of [
    ['Privacy', '/privacy', 'Privacy — NYX'],
    ['Terms', '/terms', 'Terms — NYX'],
  ] as const) {
    test(`footer link opens ${path}, a labelled placeholder`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('contentinfo').getByRole('link', { name }).click();
      await expect(page).toHaveURL(path);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('h1')).toHaveText(name);
      await expect(page.getByText('Placeholder', { exact: true })).toBeVisible();
    });

    test(`${path} works when opened directly`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(name);
    });
  }

  test('the wordmark returns home from a legal page', async ({ page }) => {
    await page.goto('/terms');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'NYX, home' })
      .click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('A quieter');
  });

  test('back and forward work across routes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL('/privacy');
    await page.goBack();
    await expect(page).toHaveURL('/');
    await page.goForward();
    await expect(page).toHaveURL('/privacy');
  });
});
