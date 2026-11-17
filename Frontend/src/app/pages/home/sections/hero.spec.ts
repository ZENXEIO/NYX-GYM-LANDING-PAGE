import { resetMatchMedia, setMatchMedia } from '../../../../test-setup';
import { site } from '../../../content/site';
import { render } from '../../../testing/render';
import { Hero } from './hero';

describe('Hero', () => {
  afterEach(() => {
    resetMatchMedia();
    site.hero.video = '';
  });

  it('has the one h1 on the page: three stacked lines of the headline', async () => {
    const { qa } = await render(Hero);
    const h1 = qa('h1');
    expect(h1).toHaveLength(1);
    expect(h1[0].id).toBe('hero-title');
    expect(qa('.hero-line').map((l) => l.textContent?.trim())).toEqual(site.hero.lines);
  });

  it('is a region labelled by its headline', async () => {
    const { q } = await render(Hero);
    expect(q('section')!.getAttribute('aria-labelledby')).toBe('hero-title');
  });

  it('has one CTA, "Book a Private Tour", linking to the tour form', async () => {
    const { qa } = await render(Hero);
    const btns = qa<HTMLAnchorElement>('a.btn');
    expect(btns).toHaveLength(1);
    expect(btns[0].textContent?.trim()).toBe('Book a Private Tour');
    expect(btns[0].getAttribute('href')).toBe('/#visit');
  });

  it('draws the arc beside the CTA', async () => {
    const { q } = await render(Hero);
    expect(q('nyx-arc svg')!.classList).toContain('arc-draw');
  });

  it('shows the embossed monogram as decoration only', async () => {
    const { q } = await render(Hero);
    const mono = q('.hero-monogram')!;
    expect(mono.getAttribute('aria-hidden')).toBe('true');
    expect(mono.classList).toContain('emboss');
    expect(mono.textContent?.trim()).toBe('NYX');
  });

  it('marks the hero photo as priority with the corner placeholder label', async () => {
    const { q } = await render(Hero);
    const ph = q('nyx-photo [role="img"]')!;
    expect(ph.getAttribute('aria-label')).toContain(site.hero.image.alt);
    expect(ph.className).toContain('justify-end');
  });

  it('carries real information in the info bar: area, hours and Instagram', async () => {
    const { qa } = await render(Hero);
    const items = qa('ul li').map((li) => li.textContent?.trim());
    expect(items).toEqual([site.contact.area, site.hoursShort, 'Instagram']);
    const ig = qa<HTMLAnchorElement>('ul a')[0];
    expect(ig.href).toBe(site.contact.instagram);
    expect(ig.target).toBe('_blank');
    expect(ig.rel).toContain('noopener');
  });

  describe('video', () => {
    const wide = () => setMatchMedia('(min-width: 1100px)', true);

    it('is not shown while no video is supplied', async () => {
      wide();
      const { q } = await render(Hero);
      expect(q('video')).toBeNull();
    });

    it('plays on wide screens with motion allowed, muted and inline, hidden from AT', async () => {
      site.hero.video = '/media/hero';
      wide();
      const { q } = await render(Hero);
      const v = q<HTMLVideoElement>('video')!;
      expect(v).toBeTruthy();
      expect(v.muted || v.hasAttribute('muted')).toBe(true);
      expect(v.hasAttribute('playsinline')).toBe(true);
      expect(v.getAttribute('aria-hidden')).toBe('true');
      expect(Array.from(v.querySelectorAll('source')).map((s) => s.getAttribute('src'))).toEqual([
        '/media/hero.webm',
        '/media/hero.mp4',
      ]);
    });

    it('is skipped on small screens (poster image only)', async () => {
      site.hero.video = '/media/hero';
      const { q } = await render(Hero);
      expect(q('video')).toBeNull();
    });

    it('is skipped when the visitor prefers reduced motion', async () => {
      site.hero.video = '/media/hero';
      wide();
      setMatchMedia('(prefers-reduced-motion: reduce)', true);
      const { q } = await render(Hero);
      expect(q('video')).toBeNull();
    });

    it('has a pause control that toggles to play and back (WCAG 2.2.2)', async () => {
      site.hero.video = '/media/hero';
      wide();
      const { q, stable } = await render(Hero);
      const v = q<HTMLVideoElement>('video')!;
      let paused = false;
      Object.defineProperty(v, 'paused', { get: () => paused });
      v.pause = vi.fn(() => void (paused = true));
      v.play = vi.fn(() => {
        paused = false;
        return Promise.resolve();
      });

      const btn = () =>
        Array.from(q('section')!.querySelectorAll('button')).find((b) =>
          /film/.test(b.textContent ?? ''),
        )!;
      expect(btn().textContent?.trim()).toBe('Pause film');

      btn().click();
      await stable();
      expect(v.pause).toHaveBeenCalled();
      expect(btn().textContent?.trim()).toBe('Play film');

      btn().click();
      await stable();
      expect(v.play).toHaveBeenCalled();
      expect(btn().textContent?.trim()).toBe('Pause film');
    });
  });
});
