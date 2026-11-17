import { expect, fillTourForm, isoInDays, mockTour, openTourForm, test } from './fixtures';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const submit = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Send request' }).click();

test.describe('tour form', () => {
  test('happy path: sends the request and confirms', async ({ page }) => {
    const calls = await mockTour(page, () => ({ status: 201 }));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);

    await expect(page.getByRole('status')).toHaveText(
      /Request received\. We will call you within one working day\./,
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toEqual({
      name: 'Asha Rao',
      phone: '+919820012345',
      email: 'asha@example.com',
      date: isoInDays(3),
      slot: 'evening',
      interest: 'tour',
      company: '',
    });
    expect(calls[0].headers['content-type']).toContain('application/json');
    expect(calls[0].headers['idempotency-key']).toMatch(UUID);
  });

  test('shows "Sending" and blocks a double submit while in flight', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const calls = await mockTour(page, async () => {
      await gate;
      return { status: 201 };
    });
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);

    const button = page.locator('form button[type="submit"]');
    await expect(button).toHaveText('Sending');
    await expect(button).toBeDisabled();
    await button.click({ force: true }).catch(() => undefined);
    await page.keyboard.press('Enter');

    release();
    await expect(page.getByRole('status')).toBeVisible();
    expect(calls).toHaveLength(1);
  });

  test('empty submit: every field explains itself and focus moves to the first', async ({
    page,
  }) => {
    const calls = await mockTour(page, () => ({ status: 201 }));
    await openTourForm(page);
    await submit(page);

    await expect(page.locator('form .error')).toHaveText([
      'Enter your name (2 to 80 characters).',
      'Enter a 10-digit Indian mobile number, e.g. 98200 12345.',
      'Enter an email address, e.g. name@example.com.',
      'Choose today or a later date.',
      'Choose a time of day.',
    ]);
    await expect(page.getByLabel('Name')).toBeFocused();
    await expect(page.getByLabel('Name')).toHaveAttribute('aria-describedby', 'tour-name-error');
    await expect(page.getByLabel('Name')).toHaveAccessibleDescription(
      'Enter your name (2 to 80 characters).',
    );
    expect(calls).toHaveLength(0);
  });

  for (const phone of [
    '9820012345',
    '98200 12345',
    '+91 98200 12345',
    '+91-9820012345',
    '919820012345',
  ]) {
    test(`accepts the phone format "${phone}"`, async ({ page }) => {
      const calls = await mockTour(page, () => ({ status: 201 }));
      await openTourForm(page);
      await fillTourForm(page, { phone });
      await submit(page);
      await expect(page.getByRole('status')).toBeVisible();
      expect(String(calls[0].body['phone'])).toMatch(/^(\+?91)?[6-9]\d{9}$/);
    });
  }

  for (const phone of ['12345', '5820012345', '+1 9820012345', '022 2345 6789']) {
    test(`rejects the phone "${phone}" and focuses it`, async ({ page }) => {
      const calls = await mockTour(page, () => ({ status: 201 }));
      await openTourForm(page);
      await fillTourForm(page, { phone });
      await submit(page);
      await expect(page.getByLabel('Mobile')).toBeFocused();
      await expect(page.locator('#tour-phone-error')).toBeVisible();
      expect(calls).toHaveLength(0);
    });
  }

  test('the date picker does not offer past days, and a typed past date is rejected', async ({
    page,
  }) => {
    await mockTour(page, () => ({ status: 201 }));
    await openTourForm(page);
    await expect(page.getByLabel('Preferred date')).toHaveAttribute('min', isoInDays(0));
    await fillTourForm(page, { date: '2020-01-01' });
    await submit(page);
    await expect(page.locator('#tour-date-error')).toHaveText('Choose today or a later date.');
  });

  test('the time slots are one radio group you can move through with arrow keys', async ({
    page,
  }) => {
    await openTourForm(page);
    const morning = page.getByRole('radio', { name: 'Morning' });
    await morning.check({ force: true });
    await morning.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Afternoon' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Afternoon' })).toBeFocused();
  });

  test('422: server field errors appear on the right input', async ({ page }) => {
    await mockTour(page, () => ({
      status: 422,
      body: { errors: { email: 'This address bounced. Check it and try again.' } },
    }));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    await expect(page.locator('#tour-email-error')).toHaveText(
      'This address bounced. Check it and try again.',
    );
    await expect(page.getByLabel('Email')).toBeFocused();
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('429: explains the limit and offers call and WhatsApp', async ({ page }) => {
    await mockTour(page, () => ({ status: 429 }));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Too many attempts. Try again in a minute or call us.');
    await expect(alert.getByRole('link', { name: /^Call / })).toHaveAttribute('href', /^tel:/);
    await expect(alert.getByRole('link', { name: 'Message on WhatsApp' })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\//,
    );
  });

  test('5xx: retries once with the same key, then succeeds', async ({ page }) => {
    const calls = await mockTour(page, (_c, n) => ({ status: n === 1 ? 503 : 201 }));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    await expect(page.getByRole('status')).toBeVisible();
    expect(calls).toHaveLength(2);
    expect(calls[1].headers['idempotency-key']).toBe(calls[0].headers['idempotency-key']);
  });

  test('5xx twice: shows the phone/WhatsApp fallback and keeps the typed details', async ({
    page,
  }) => {
    const calls = await mockTour(page, () => ({ status: 500 }));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    await expect(page.getByRole('alert')).toContainText('The form is not responding right now.');
    expect(calls).toHaveLength(2);
    await expect(page.getByLabel('Name')).toHaveValue('Asha Rao');
  });

  test('network failure: falls back to phone/WhatsApp', async ({ page }) => {
    await page.route('https://forms.nyx.test/tour', (r) => r.abort('connectionrefused'));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    await expect(page.getByRole('alert')).toContainText('Call or message us instead');
  });

  test('timeout: gives up after 10 s (+ one retry) and falls back', async ({ page }) => {
    test.slow();
    const calls = await mockTour(page, () => new Promise<void>(() => undefined));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 30_000 });
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });

  test('retrying by hand after a failure reuses the idempotency key (no duplicate leads)', async ({
    page,
  }) => {
    const calls = await mockTour(page, (_c, n) => ({ status: n <= 2 ? 500 : 201 }));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    await expect(page.getByRole('alert')).toBeVisible();
    await submit(page);
    await expect(page.getByRole('status')).toBeVisible();
    expect(new Set(calls.map((c) => c.headers['idempotency-key'])).size).toBe(1);
  });

  test('"Book another tour" starts a fresh request with a new key', async ({ page }) => {
    const calls = await mockTour(page, () => ({ status: 201 }));
    await openTourForm(page);
    await fillTourForm(page);
    await submit(page);
    await page.getByRole('button', { name: 'Book another tour' }).click();
    await expect(page.getByLabel('Name')).toHaveValue('');
    await fillTourForm(page, { name: 'Ravi Shah' });
    await submit(page);
    await expect(page.getByRole('status')).toBeVisible();
    expect(calls[1].headers['idempotency-key']).not.toBe(calls[0].headers['idempotency-key']);
  });

  test('a bot filling the honeypot gets "success" but nothing is sent', async ({ page }) => {
    const calls = await mockTour(page, () => ({ status: 201 }));
    await openTourForm(page);
    await fillTourForm(page);
    await page.locator('#tour-company').fill('Acme Bots', { force: true });
    await submit(page);
    await expect(page.getByRole('status')).toBeVisible();
    expect(calls).toHaveLength(0);
  });

  for (const [tier, value] of [
    ['Dusk', 'dusk'],
    ['Nocturne', 'nocturne'],
    ['Eclipse', 'eclipse'],
  ] as const) {
    test(`"Enquire" on ${tier} pre-fills the form and sends the tier`, async ({ page }) => {
      const calls = await mockTour(page, () => ({ status: 201 }));
      await page.goto('/');
      const link = page.getByRole('link', { name: `Enquire about ${tier} membership` });
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await expect(page).toHaveURL(/#visit$/);
      // On one-column layouts the form sits below the #visit heading; it hydrates
      // (and applies the pre-fill) once it scrolls into view.
      await page.locator('#tour-name').scrollIntoViewIfNeeded();
      await expect(page.locator('#tour-date')).toHaveAttribute('min', /\d/);
      await expect(page.getByLabel('Interested in')).toHaveValue(value);
      await fillTourForm(page);
      await submit(page);
      await expect(page.getByRole('status')).toBeVisible();
      expect(calls[0].body['interest']).toBe(value);
    });
  }

  test('the form can be completed with the keyboard alone', async ({ page }) => {
    await mockTour(page, () => ({ status: 201 }));
    await openTourForm(page);
    await page.getByLabel('Name').focus();
    await page.keyboard.type('Asha Rao');
    await page.keyboard.press('Tab');
    await page.keyboard.type('9820012345');
    await page.keyboard.press('Tab');
    await page.keyboard.type('asha@example.com');
    await page.getByLabel('Preferred date').fill(isoInDays(2));
    // Tab inside a date field moves between its day/month/year parts, so jump to
    // the radio group directly, then use the keyboard as a person would.
    await page.getByRole('radio', { name: 'Morning' }).focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Afternoon' })).toBeChecked();
    await page.getByRole('button', { name: 'Send request' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toBeVisible();
  });
});
