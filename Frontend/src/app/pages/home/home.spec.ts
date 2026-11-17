import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { site } from '../../content/site';
import { environment } from '../../../environments/environment';
import { render } from '../../testing/render';
import { Home } from './home';

const providers = [provideHttpClient(), provideHttpClientTesting()];

// First render loads every deferred section chunk, so allow more than the 5 s default.
describe('Home page', { timeout: 20_000 }, () => {
  it('renders the sections in the agreed order', async () => {
    const { el } = await render(Home, { providers });
    const tags = Array.from(
      el.querySelectorAll(
        'nyx-hero, nyx-club, nyx-facilities, nyx-training, nyx-membership, nyx-testimonials, nyx-visit',
      ),
    ).map((n) => n.tagName.toLowerCase());
    expect(tags).toEqual([
      'nyx-hero',
      'nyx-club',
      'nyx-facilities',
      'nyx-training',
      'nyx-membership',
      'nyx-testimonials',
      'nyx-visit',
    ]);
  });

  it('alternates dark sections with the two light pauses (Club, Membership)', async () => {
    const { qa } = await render(Home, { providers });
    const light = qa('section[data-surface="light"]').map((s) => s.id);
    expect(light).toEqual(['club', 'membership']);
  });

  it('has exactly one h1, and every section heading is an h2', async () => {
    const { qa } = await render(Home, { providers });
    expect(qa('h1')).toHaveLength(1);
    const sectionHeadings = qa('section > div h2, section h2').map((h) => h.textContent?.trim());
    expect(sectionHeadings).toEqual(
      expect.arrayContaining([
        site.club.heading,
        site.facilities.heading,
        site.training.heading,
        site.membership.heading,
        site.testimonials.heading,
        site.visit.heading,
      ]),
    );
  });

  it('has an element for every nav fragment, so every menu link lands somewhere', async () => {
    const { q } = await render(Home, { providers });
    for (const { fragment } of site.nav) expect(q(`#${fragment}`), fragment).toBeTruthy();
  });

  it('uses unique ids across the whole page', async () => {
    const { qa } = await render(Home, { providers });
    const ids = qa('[id]').map((e) => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('every aria-labelledby points at an element that exists', async () => {
    const { qa, q } = await render(Home, { providers });
    for (const el of qa('[aria-labelledby]')) {
      for (const id of el.getAttribute('aria-labelledby')!.split(' ')) {
        expect(q(`#${id}`), id).toBeTruthy();
      }
    }
  });

  it('every image and placeholder has a text alternative', async () => {
    const { qa } = await render(Home, { providers });
    for (const img of qa('img')) expect(img.getAttribute('alt')).toBeTruthy();
    for (const ph of qa('[role="img"]')) expect(ph.getAttribute('aria-label')).toBeTruthy();
  });

  it('every placeholder photo is labelled as a placeholder', async () => {
    const { qa } = await render(Home, { providers });
    for (const ph of qa('[role="img"]')) expect(ph.textContent).toContain('Placeholder photo');
  });

  it('opens external links safely', async () => {
    const { qa } = await render(Home, { providers });
    for (const a of qa<HTMLAnchorElement>('a[target="_blank"]'))
      expect(a.rel).toContain('noopener');
  });

  it('never appends an arrow to buttons or links', async () => {
    const { qa } = await render(Home, { providers });
    for (const b of qa('a, button')) expect(b.textContent).not.toMatch(/→|->/);
  });

  it('sets the homepage title, description and canonical URL', async () => {
    await render(Home, { providers });
    const doc = TestBed.inject(DOCUMENT);
    expect(doc.title).toBe(site.seo.home.title);
    expect(doc.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      site.seo.home.description,
    );
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${environment.siteUrl}/`,
    );
  });
});
