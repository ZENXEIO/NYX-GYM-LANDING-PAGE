import { TestBed } from '@angular/core/testing';
import { EnquiryState } from '../../../core/enquiry.state';
import { site } from '../../../content/site';
import { render } from '../../../testing/render';
import { Membership } from './membership';

describe('Membership section', () => {
  it('is the #membership anchor on a light (plaster) surface', async () => {
    const { q } = await render(Membership);
    const s = q('section')!;
    expect(s.id).toBe('membership');
    expect(s.getAttribute('data-surface')).toBe('light');
  });

  it('presents three invitations in order, each with arc, name, tagline, copy and inclusions', async () => {
    const { qa } = await render(Membership);
    const cards = qa('li.invitation-frame');
    expect(cards).toHaveLength(3);
    cards.forEach((card, i) => {
      const t = site.membership.tiers[i];
      expect(card.querySelector('nyx-arc')).toBeTruthy();
      expect(card.querySelector('h3')!.textContent?.trim()).toBe(t.name);
      expect(card.textContent).toContain(t.tagline);
      expect(card.textContent).toContain(t.copy);
      const items = Array.from(card.querySelectorAll('ul li')).map((li) => li.textContent?.trim());
      expect(items).toEqual(t.includes);
    });
  });

  it('sets tier names in the editorial serif', async () => {
    const { qa } = await render(Membership);
    for (const h of qa('li.invitation-frame h3')) expect(h.classList).toContain('text-editorial');
  });

  it('shows no prices, only the fees note', async () => {
    const { text } = await render(Membership);
    expect(text()).not.toMatch(/₹|\$|per month|\/mo/i);
    expect(text()).toContain(site.membership.feesNote);
  });

  it('each "Enquire" link names its tier for screen readers and goes to the form', async () => {
    const { qa } = await render(Membership);
    const links = qa<HTMLAnchorElement>('a.btn');
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Enquire', 'Enquire', 'Enquire']);
    expect(links.map((a) => a.getAttribute('aria-label'))).toEqual([
      'Enquire about Dusk membership',
      'Enquire about Nocturne membership',
      'Enquire about Eclipse membership',
    ]);
    for (const a of links) expect(a.getAttribute('href')).toBe('/#visit');
  });

  it.each(['dusk', 'nocturne', 'eclipse'] as const)(
    'clicking Enquire on %s records the choice for the tour form',
    async (id) => {
      const { qa } = await render(Membership);
      const i = site.membership.tiers.findIndex((t) => t.id === id);
      qa<HTMLAnchorElement>('a.btn')[i].click();
      expect(TestBed.inject(EnquiryState).interest()).toBe(id);
    },
  );
});
