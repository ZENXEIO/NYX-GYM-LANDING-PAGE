import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { render } from '../../testing/render';
import { Legal } from './legal';

describe('Legal page (placeholder)', () => {
  it.each([
    ['privacy', 'Privacy'],
    ['terms', 'Terms'],
  ] as const)('/%s has its own h1, a placeholder label and SEO tags', async (kind, title) => {
    const { q, text } = await render(Legal, { inputs: { kind } });
    expect(q('h1')!.textContent?.trim()).toBe(title);
    expect(text()).toContain('Placeholder');
    expect(text()).toContain(`The approved ${title.toLowerCase()} text will appear here.`);

    const doc = TestBed.inject(DOCUMENT);
    expect(doc.title).toBe(`${title} — NYX`);
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${environment.siteUrl}/${kind}`,
    );
    expect(
      doc.head.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBeTruthy();
  });

  it('defaults to the privacy page', async () => {
    const { q } = await render(Legal);
    expect(q('h1')!.textContent?.trim()).toBe('Privacy');
  });

  it('updates the content and SEO when the route input changes', async () => {
    const { fixture, q, stable } = await render(Legal, { inputs: { kind: 'privacy' } });
    fixture.componentRef.setInput('kind', 'terms');
    await stable();
    expect(q('h1')!.textContent?.trim()).toBe('Terms');
    expect(TestBed.inject(DOCUMENT).title).toBe('Terms — NYX');
  });
});
