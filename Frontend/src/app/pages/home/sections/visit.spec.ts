import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DeferBlockBehavior, DeferBlockState } from '@angular/core/testing';
import { site } from '../../../content/site';
import { render } from '../../../testing/render';
import { Visit } from './visit';

const providers = [provideHttpClient(), provideHttpClientTesting()];

describe('Visit section', () => {
  it('is the #visit anchor that every CTA points to', async () => {
    const { q } = await render(Visit, { providers });
    expect(q('section')!.id).toBe('visit');
    expect(q('h2#visit-title')!.textContent?.trim()).toBe(site.visit.heading);
  });

  it('lists the address and labels it as a placeholder', async () => {
    const { q, text } = await render(Visit, { providers });
    for (const line of site.contact.addressLines) expect(q('address')!.textContent).toContain(line);
    expect(text()).toContain('Placeholder address');
  });

  it('lists the opening hours for every day', async () => {
    const { text } = await render(Visit, { providers });
    for (const h of site.hours) {
      expect(text()).toContain(h.days);
      expect(text()).toContain(h.time);
    }
  });

  it('offers phone, WhatsApp and email', async () => {
    const { q } = await render(Visit, { providers });
    expect(q(`dd a[href="${site.contact.phoneHref}"]`)).toBeTruthy();
    expect(q(`dd a[href="${site.contact.whatsappHref}"]`)).toBeTruthy();
    expect(q(`dd a[href="mailto:${site.contact.email}"]`)).toBeTruthy();
  });

  it('includes the click-to-load map', async () => {
    const { q } = await render(Visit, { providers });
    expect(q('nyx-map-embed')).toBeTruthy();
    expect(q('iframe')).toBeNull();
  });

  it('renders the tour form once its deferred block loads', async () => {
    const { q } = await render(Visit, { providers });
    expect(q('nyx-tour-form form')).toBeTruthy();
  });

  it('shows the phone number while the form is still loading (graceful degradation)', async () => {
    const { fixture, q, stable } = await render(Visit, {
      providers,
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });
    const [block] = await fixture.getDeferBlocks();
    await block.render(DeferBlockState.Placeholder);
    await stable();
    expect(q('nyx-tour-form')).toBeNull();
    expect(q(`a[href="${site.contact.phoneHref}"]`)).toBeTruthy();
    expect(q('.text-h3')!.textContent?.trim()).toBe(site.visit.form.heading);
  });
});
