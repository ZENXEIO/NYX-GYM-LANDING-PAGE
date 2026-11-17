import { SiteImage } from '../content/site';
import { render } from '../testing/render';
import { Photo } from './photo';

const placeholder: SiteImage = {
  alt: 'Still lap pool at dawn',
  label: 'Pool at dawn',
  spec: '3:2, ≥ 2400×1600',
};
const real: SiteImage = { ...placeholder, src: '/images/pool', focus: '30% 70%' };

describe('Photo', () => {
  describe('without a source (placeholder)', () => {
    it('renders a labelled block that screen readers announce as a placeholder image', async () => {
      const { q, text } = await render(Photo, { inputs: { image: placeholder } });
      const ph = q('[role="img"]')!;
      expect(ph.getAttribute('aria-label')).toBe('Still lap pool at dawn (placeholder image)');
      expect(text()).toContain('Placeholder photo');
      expect(text()).toContain('Pool at dawn');
      expect(text()).toContain('3:2, ≥ 2400×1600');
      expect(q('img')).toBeNull();
    });

    it('centres the label by default', async () => {
      const { q } = await render(Photo, { inputs: { image: placeholder } });
      expect(q('[role="img"]')!.className).toContain('justify-center');
    });

    it('moves the label to the top-right corner (clear of the nav) in corner mode', async () => {
      const { q } = await render(Photo, { inputs: { image: placeholder, corner: true } });
      const cls = q('[role="img"]')!.className;
      expect(cls).toContain('justify-end');
      expect(cls).toContain('pt-24');
    });
  });

  describe('with a source', () => {
    it('renders an optimised, responsive image with alt text', async () => {
      const { q } = await render(Photo, {
        inputs: { image: real, sizes: '(min-width: 768px) 58vw, 100vw' },
      });
      const img = q<HTMLImageElement>('img')!;
      expect(img.alt).toBe('Still lap pool at dawn');
      expect(img.getAttribute('sizes')).toContain('58vw');
      expect(img.getAttribute('srcset')).toContain('/images/pool-640.webp 640w');
      expect(img.getAttribute('srcset')).toContain('/images/pool-2400.webp 2400w');
      expect(q('[role="img"]')).toBeNull();
    });

    it('keeps the focal point with object-position', async () => {
      const { q } = await render(Photo, { inputs: { image: real } });
      expect(q('img')!.style.objectPosition).toBe('30% 70%');
    });

    it('defaults the focal point to the centre', async () => {
      const { q } = await render(Photo, { inputs: { image: { ...real, focus: undefined } } });
      expect(q('img')!.style.objectPosition).toBe('50% 50%');
    });

    it('lazy-loads non-hero images by default', async () => {
      const lazy = await render(Photo, { inputs: { image: real } });
      expect(lazy.q('img')!.getAttribute('loading')).toBe('lazy');
    });

    it('marks the hero image as priority (eager, high fetch priority)', async () => {
      const { q } = await render(Photo, { inputs: { image: real, priority: true } });
      expect(q('img')!.getAttribute('loading')).toBe('eager');
      expect(q('img')!.getAttribute('fetchpriority')).toBe('high');
    });

    it('opts into the parallax class only when asked', async () => {
      const plain = await render(Photo, { inputs: { image: real } });
      expect(plain.q('img')!.classList).not.toContain('parallax');
    });

    it('applies the parallax class when asked', async () => {
      const { q } = await render(Photo, { inputs: { image: real, parallax: true } });
      expect(q('img')!.classList).toContain('parallax');
    });
  });

  it('never sets its own position, so the caller decides (regression: 0-height photos)', async () => {
    const { el } = await render(Photo, { inputs: { image: placeholder } });
    expect(el.className).not.toMatch(/\b(relative|absolute)\b/);
  });
});
