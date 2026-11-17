import { site } from '../../../content/site';
import { render } from '../../../testing/render';
import { Facilities } from './facilities';

describe('Facilities section', () => {
  it('is the #facilities anchor on a dark surface', async () => {
    const { q } = await render(Facilities);
    const s = q('section')!;
    expect(s.id).toBe('facilities');
    expect(s.hasAttribute('data-surface')).toBe(false);
    expect(s.getAttribute('aria-labelledby')).toBe('facilities-title');
  });

  it('renders the six spaces in order as labelled articles with an h3 and two lines', async () => {
    const { qa } = await render(Facilities);
    const articles = qa('article');
    expect(articles).toHaveLength(6);
    articles.forEach((a, i) => {
      const f = site.facilities.items[i];
      const h3 = a.querySelector('h3')!;
      expect(h3.textContent?.trim()).toBe(f.name);
      expect(a.getAttribute('aria-labelledby')).toBe(h3.id);
      expect(a.textContent).toContain(f.lines[0]);
      expect(a.textContent).toContain(f.lines[1]);
    });
  });

  it('uses unique heading ids (valid aria-labelledby targets)', async () => {
    const { qa } = await render(Facilities);
    const ids = qa('h3').map((h) => h.id);
    expect(new Set(ids).size).toBe(6);
  });

  it('alternates the image side row by row (no identical grid)', async () => {
    const { qa } = await render(Facilities);
    const sides = qa('figure').map((f) => (f.className.includes('md:col-start-6') ? 'R' : 'L'));
    expect(sides).toEqual(['L', 'R', 'L', 'R', 'L', 'R']);
  });

  it('uses full-bleed rectangles, never arch frames, with the reveal and parallax hooks', async () => {
    const { qa, q } = await render(Facilities);
    expect(q('nyx-arch-frame')).toBeNull();
    for (const fig of qa('figure')) {
      expect(fig.classList).toContain('photo-reveal');
      expect(fig.classList).toContain('aspect-[3/2]');
    }
  });

  it('never numbers the rows', async () => {
    const { text } = await render(Facilities);
    expect(text()).not.toMatch(/\b0[1-6]\b/);
  });
});
