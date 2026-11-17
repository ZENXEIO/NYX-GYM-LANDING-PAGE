import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { EnquiryState } from '../../../core/enquiry.state';
import { TourApiService, TourRequest, TourResult } from '../../../core/tour-api.service';
import { site } from '../../../content/site';
import { fill, render } from '../../../testing/render';
import { TURNSTILE_SITE_KEY, TourForm, TurnstileApi } from './tour-form';
import { todayIso } from './tour-form.validators';

const copy = site.visit.form;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Controllable stand-in for the API: each submit returns a Subject the test resolves. */
class FakeApi {
  calls: { body: TourRequest; key: string; reply: Subject<TourResult> }[] = [];
  submit = vi.fn((body: TourRequest, key: string) => {
    const reply = new Subject<TourResult>();
    this.calls.push({ body, key, reply });
    return reply.asObservable();
  });
  respond(result: TourResult, i = this.calls.length - 1) {
    this.calls[i].reply.next(result);
    this.calls[i].reply.complete();
  }
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return todayIso(d);
}

async function setup({ turnstileSiteKey = '' } = {}) {
  const api = new FakeApi();
  const r = await render(TourForm, {
    providers: [
      { provide: TourApiService, useValue: api },
      { provide: TURNSTILE_SITE_KEY, useValue: turnstileSiteKey },
    ],
  });
  document.body.appendChild(r.el); // focus() only works on attached nodes

  const input = (id: string) => r.q<HTMLInputElement>(`#tour-${id}`)!;
  const submitBtn = () => r.q<HTMLButtonElement>('button[type="submit"]')!;
  const slot = (value: string) => r.q<HTMLInputElement>(`input[type="radio"][value="${value}"]`)!;
  const errorText = (field: string) => r.q(`#tour-${field}-error`)?.textContent?.trim() ?? null;

  async function fillValid(
    over: Partial<Record<'name' | 'phone' | 'email' | 'date', string>> = {},
  ) {
    fill(input('name'), over.name ?? 'Asha Rao');
    fill(input('phone'), over.phone ?? '+91 98200-12345');
    fill(input('email'), over.email ?? 'asha@example.com');
    fill(input('date'), over.date ?? tomorrow());
    slot('evening').click();
    await r.stable();
  }

  async function submit() {
    r.q<HTMLFormElement>('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await r.stable();
  }

  return { ...r, api, input, submitBtn, slot, errorText, fillValid, submit };
}

describe('TourForm', () => {
  afterEach(() =>
    document.body.querySelectorAll('nyx-tour-form, div[id^="root"]').forEach((n) => n.remove()),
  );

  describe('structure and accessibility', () => {
    it('labels every field (label[for] matches an input id)', async () => {
      const { q } = await setup();
      for (const id of ['tour-name', 'tour-phone', 'tour-email', 'tour-date', 'tour-interest']) {
        expect(q(`label[for="${id}"]`), id).toBeTruthy();
        expect(q(`#${id}`), id).toBeTruthy();
      }
    });

    it('is named by its heading', async () => {
      const { q } = await setup();
      expect(q('form')!.getAttribute('aria-labelledby')).toBe('tour-form-title');
      expect(q('#tour-form-title')!.textContent?.trim()).toBe(copy.heading);
    });

    it('groups the time slots as radios under a legend', async () => {
      const { q, qa } = await setup();
      expect(q('fieldset legend')!.textContent?.trim()).toBe('Preferred time');
      const radios = qa<HTMLInputElement>('fieldset input[type="radio"]');
      expect(radios.map((r) => r.value)).toEqual(['morning', 'afternoon', 'evening']);
      expect(new Set(radios.map((r) => r.name)).size).toBe(1);
    });

    it('uses the right input types and autocomplete hints for mobile keyboards', async () => {
      const { input } = await setup();
      expect(input('name').autocomplete).toBe('name');
      expect(input('phone').type).toBe('tel');
      expect(input('phone').inputMode).toBe('tel');
      expect(input('phone').autocomplete).toBe('tel');
      expect(input('email').type).toBe('email');
      expect(input('email').autocomplete).toBe('email');
      expect(input('date').type).toBe('date');
    });

    it('stops the date picker at today', async () => {
      const { input } = await setup();
      expect(input('date').min).toBe(todayIso());
    });

    it('offers every interest option, defaulting to a tour', async () => {
      const { q, qa } = await setup();
      expect(qa<HTMLOptionElement>('#tour-interest option').map((o) => o.value)).toEqual(
        copy.interests.map((i) => i.value),
      );
      expect(q<HTMLSelectElement>('#tour-interest')!.value).toBe('tour');
    });

    it('hides the honeypot from people and assistive technology', async () => {
      const { input } = await setup();
      const company = input('company');
      expect(company.tabIndex).toBe(-1);
      expect(company.autocomplete).toBe('off');
      expect(company.closest('[aria-hidden="true"]')).toBeTruthy();
    });

    it('uses native validation off so its own messages are shown consistently', async () => {
      const { q } = await setup();
      expect(q('form')!.hasAttribute('novalidate')).toBe(true);
    });

    it('does not render a Turnstile widget when no site key is configured', async () => {
      const { q } = await setup();
      expect(q('.min-h-\\[65px\\]')).toBeNull();
    });

    it('says exactly what the button does', async () => {
      const { submitBtn } = await setup();
      expect(submitBtn().textContent?.trim()).toBe('Send request');
    });
  });

  describe('client-side validation', () => {
    it('shows no errors before the visitor interacts', async () => {
      const { qa } = await setup();
      expect(qa('.error')).toHaveLength(0);
      expect(qa('[aria-invalid="true"]')).toHaveLength(0);
    });

    it('on an empty submit: shows every error, links them, focuses the first, sends nothing', async () => {
      const { submit, errorText, input, q, api } = await setup();
      await submit();

      expect(errorText('name')).toBe(copy.errors.name);
      expect(errorText('phone')).toBe(copy.errors.phone);
      expect(errorText('email')).toBe(copy.errors.email);
      expect(errorText('date')).toBe(copy.errors.date);
      expect(errorText('slot')).toBe(copy.errors.slot);

      for (const f of ['name', 'phone', 'email', 'date']) {
        expect(input(f).getAttribute('aria-invalid')).toBe('true');
        expect(input(f).getAttribute('aria-describedby')).toBe(`tour-${f}-error`);
      }
      expect(q('fieldset')!.getAttribute('aria-describedby')).toBe('tour-slot-error');

      await new Promise((r) => setTimeout(r));
      expect(document.activeElement).toBe(input('name'));
      expect(api.submit).not.toHaveBeenCalled();
    });

    it('shows a field’s error after it is touched and left invalid', async () => {
      const { input, errorText, stable } = await setup();
      fill(input('phone'), '12345');
      await stable();
      expect(errorText('phone')).toBe(copy.errors.phone);
      expect(errorText('name')).toBeNull(); // untouched fields stay quiet
    });

    it('clears the error as soon as the value is fixed', async () => {
      const { input, errorText, stable } = await setup();
      fill(input('phone'), '12345');
      await stable();
      fill(input('phone'), '98200 12345');
      await stable();
      expect(errorText('phone')).toBeNull();
      expect(input('phone').getAttribute('aria-invalid')).toBe('false');
      expect(input('phone').hasAttribute('aria-describedby')).toBe(false);
    });

    it.each([
      ['name', 'A', copy.errors.name],
      ['name', 'x'.repeat(81), copy.errors.name],
      ['email', 'asha@', copy.errors.email],
      ['phone', '5820012345', copy.errors.phone],
      ['phone', '+1 9820012345', copy.errors.phone],
    ])('rejects %s = "%s"', async (field, value, message) => {
      const { input, errorText, stable } = await setup();
      fill(input(field), value);
      await stable();
      expect(errorText(field)).toBe(message);
    });

    it('accepts names of exactly 2 and 80 characters', async () => {
      const { input, errorText, stable } = await setup();
      fill(input('name'), 'Al');
      await stable();
      expect(errorText('name')).toBeNull();
      fill(input('name'), 'x'.repeat(80));
      await stable();
      expect(errorText('name')).toBeNull();
    });

    it('rejects a date in the past', async () => {
      const { input, errorText, stable } = await setup();
      fill(input('date'), '2020-01-01');
      await stable();
      expect(errorText('date')).toBe(copy.errors.date);
    });

    it('focuses the first invalid field in document order, not the first in the list', async () => {
      const { fillValid, input, submit } = await setup();
      await fillValid({ email: 'nope' });
      await submit();
      await new Promise((r) => setTimeout(r));
      expect(document.activeElement).toBe(input('email'));
    });
  });

  describe('submitting', () => {
    it('sends the normalised request with an idempotency key', async () => {
      const { fillValid, submit, api } = await setup();
      await fillValid();
      await submit();

      expect(api.submit).toHaveBeenCalledTimes(1);
      const { body, key } = api.calls[0];
      expect(body).toEqual({
        name: 'Asha Rao',
        phone: '+919820012345',
        email: 'asha@example.com',
        date: tomorrow(),
        slot: 'evening',
        interest: 'tour',
        company: '',
        turnstileToken: undefined,
      });
      expect(key).toMatch(UUID);
    });

    it('shows "Sending" and disables the button while in flight', async () => {
      const { fillValid, submit, submitBtn } = await setup();
      await fillValid();
      await submit();
      expect(submitBtn().disabled).toBe(true);
      expect(submitBtn().textContent?.trim()).toBe(copy.sending);
    });

    it('cannot be double-submitted', async () => {
      const { fillValid, submit, api } = await setup();
      await fillValid();
      await submit();
      await submit();
      await submit();
      expect(api.submit).toHaveBeenCalledTimes(1);
    });

    it('on success: announces the confirmation and replaces the form', async () => {
      const { fillValid, submit, api, q, stable } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'success' });
      await stable();
      const status = q('[role="status"]')!;
      expect(status.textContent).toContain(copy.success);
      expect(q('form')).toBeNull();
    });

    it('"Book another tour" brings back an empty form and uses a fresh idempotency key', async () => {
      const { fillValid, submit, api, q, stable, input } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'success' });
      await stable();

      q<HTMLButtonElement>('[role="status"] button')!.click();
      await stable();
      expect(input('name').value).toBe('');
      expect(q('.error')).toBeNull(); // a fresh form does not shout

      await fillValid({ name: 'Ravi Shah' });
      await submit();
      expect(api.calls[1].key).toMatch(UUID);
      expect(api.calls[1].key).not.toBe(api.calls[0].key);
    });

    it('maps server field errors (422) onto the inputs and focuses the first', async () => {
      const { fillValid, submit, api, errorText, input, stable, submitBtn } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'invalid', fields: { phone: 'This number is not reachable.' } });
      await stable();
      await new Promise((r) => setTimeout(r));

      expect(errorText('phone')).toBe('This number is not reachable.');
      expect(input('phone').getAttribute('aria-invalid')).toBe('true');
      expect(document.activeElement).toBe(input('phone'));
      expect(submitBtn().disabled).toBe(false);
    });

    it('clears server errors on the next submit', async () => {
      const { fillValid, submit, api, errorText, stable } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'invalid', fields: { phone: 'Not reachable.' } });
      await stable();
      await submit();
      expect(errorText('phone')).toBeNull();
    });

    it('on 429: explains, offers call and WhatsApp, and lets the visitor try again', async () => {
      const { fillValid, submit, api, q, stable, submitBtn } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'rate-limited' });
      await stable();

      const alert = q('[role="alert"]')!;
      expect(alert.textContent).toContain(copy.rateLimited);
      expect(alert.querySelector(`a[href="${site.contact.phoneHref}"]`)).toBeTruthy();
      expect(alert.querySelector(`a[href="${site.contact.whatsappHref}"]`)).toBeTruthy();
      expect(submitBtn().disabled).toBe(false);
    });

    it('when the endpoint is down: shows the phone/WhatsApp fallback so no lead is lost', async () => {
      const { fillValid, submit, api, q, stable } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'unavailable' });
      await stable();
      const alert = q('[role="alert"]')!;
      expect(alert.textContent).toContain(copy.unavailable);
      expect(alert.textContent).toContain(`Call ${site.contact.phoneDisplay}`);
    });

    it('reuses the same idempotency key when the visitor retries after a failure', async () => {
      const { fillValid, submit, api, stable } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'unavailable' });
      await stable();
      await submit();
      expect(api.calls).toHaveLength(2);
      expect(api.calls[1].key).toBe(api.calls[0].key);
    });

    it('keeps what the visitor typed after a failure', async () => {
      const { fillValid, submit, api, stable, input } = await setup();
      await fillValid();
      await submit();
      api.respond({ kind: 'unavailable' });
      await stable();
      expect(input('name').value).toBe('Asha Rao');
      expect(input('email').value).toBe('asha@example.com');
    });
  });

  describe('membership pre-fill', () => {
    it('pre-selects the tier chosen with "Enquire"', async () => {
      const { q, stable } = await setup();
      TestBed.inject(EnquiryState).interest.set('nocturne');
      await stable();
      expect(q<HTMLSelectElement>('#tour-interest')!.value).toBe('nocturne');
    });

    it('sends the chosen tier with the request', async () => {
      const { fillValid, submit, api, stable } = await setup();
      TestBed.inject(EnquiryState).interest.set('eclipse');
      await stable();
      await fillValid();
      await submit();
      expect(api.calls[0].body.interest).toBe('eclipse');
    });

    it('keeps the chosen tier when starting again after success', async () => {
      const { fillValid, submit, api, q, stable } = await setup();
      TestBed.inject(EnquiryState).interest.set('dusk');
      await stable();
      await fillValid();
      await submit();
      api.respond({ kind: 'success' });
      await stable();
      q<HTMLButtonElement>('[role="status"] button')!.click();
      await stable();
      expect(q<HTMLSelectElement>('#tour-interest')!.value).toBe('dusk');
    });

    it('lets the visitor change the interest by hand', async () => {
      const { q, fillValid, submit, api, stable } = await setup();
      fill(q<HTMLSelectElement>('#tour-interest')!, 'dusk');
      await stable();
      await fillValid();
      await submit();
      expect(api.calls[0].body.interest).toBe('dusk');
    });
  });

  describe('Turnstile (site key configured)', () => {
    type TurnstileWindow = Window & { turnstile?: TurnstileApi };
    const KEY = '0x4AAAAAAA-test';

    /** Stand-in for window.turnstile: each render() returns a new widget id. */
    function fakeTurnstile() {
      const widgets: { el: HTMLElement; solve: (token: string) => void; expire: () => void }[] = [];
      const api = {
        render: vi.fn((el: HTMLElement, opts: Parameters<TurnstileApi['render']>[1]) => {
          widgets.push({ el, solve: opts.callback, expire: opts['expired-callback'] });
          return `w${widgets.length}`;
        }),
        reset: vi.fn(),
      };
      (window as TurnstileWindow).turnstile = api;
      return { api, widgets, latest: () => widgets[widgets.length - 1] };
    }

    afterEach(() => delete (window as TurnstileWindow).turnstile);

    it('renders the widget with the site key and sends the solved token', async () => {
      const ts = fakeTurnstile();
      const { fillValid, submit, api, q } = await setup({ turnstileSiteKey: KEY });
      expect(ts.api.render).toHaveBeenCalledTimes(1);
      expect(ts.api.render.mock.calls[0][1]).toMatchObject({ sitekey: KEY, theme: 'dark' });
      expect(q('form')!.contains(ts.latest().el)).toBe(true);

      ts.latest().solve('tok-1');
      await fillValid();
      await submit();
      expect(api.calls[0].body.turnstileToken).toBe('tok-1');
    });

    it('drops an expired token instead of sending it', async () => {
      const ts = fakeTurnstile();
      const { fillValid, submit, api } = await setup({ turnstileSiteKey: KEY });
      ts.latest().solve('tok-1');
      ts.latest().expire();
      await fillValid();
      await submit();
      expect(api.calls[0].body.turnstileToken).toBeUndefined();
    });

    for (const result of [
      { kind: 'invalid', fields: { phone: 'Not reachable.' } },
      { kind: 'rate-limited' },
      { kind: 'unavailable' },
    ] as TourResult[]) {
      it(`after a "${result.kind}" reply: resets the widget and never resends the spent token`, async () => {
        const ts = fakeTurnstile();
        const { fillValid, submit, api, stable } = await setup({ turnstileSiteKey: KEY });
        ts.latest().solve('tok-1');
        await fillValid();
        await submit();
        api.respond(result);
        await stable();

        expect(ts.api.reset).toHaveBeenCalledWith('w1');
        await fillValid();
        await submit();
        expect(api.calls[1].body.turnstileToken).toBeUndefined();
      });
    }

    it('"Book another tour" renders a fresh widget into the new form', async () => {
      const ts = fakeTurnstile();
      const { fillValid, submit, api, q, stable } = await setup({ turnstileSiteKey: KEY });
      ts.latest().solve('tok-1');
      await fillValid();
      await submit();
      api.respond({ kind: 'success' });
      await stable();

      q<HTMLButtonElement>('[role="status"] button')!.click();
      await stable();
      expect(ts.api.render).toHaveBeenCalledTimes(2);
      expect(q('form')!.contains(ts.latest().el)).toBe(true);

      ts.latest().solve('tok-2');
      await fillValid({ name: 'Ravi Shah' });
      await submit();
      expect(api.calls[1].body.turnstileToken).toBe('tok-2');
    });
  });
});
