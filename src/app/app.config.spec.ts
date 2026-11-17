import { IMAGE_WIDTHS, nyxImageLoader } from './app.config';

describe('nyxImageLoader', () => {
  const load = (width?: number) => nyxImageLoader({ src: '/images/pool', width });

  it('maps a requested width to the smallest generated width that covers it', () => {
    expect(load(1)).toBe('/images/pool-640.webp');
    expect(load(640)).toBe('/images/pool-640.webp');
    expect(load(641)).toBe('/images/pool-1080.webp');
    expect(load(1080)).toBe('/images/pool-1080.webp');
    expect(load(1200)).toBe('/images/pool-1600.webp');
    expect(load(2000)).toBe('/images/pool-2400.webp');
  });

  it('caps at the largest generated width instead of requesting a file that does not exist', () => {
    expect(load(3840)).toBe('/images/pool-2400.webp');
  });

  it('defaults to 1600 when no width is requested', () => {
    expect(load()).toBe('/images/pool-1600.webp');
  });

  it('only ever produces widths that scripts/optimize-images.mjs generates', () => {
    const produced = new Set(
      [1, 500, 700, 1100, 1700, 2500, 5000].map((w) => Number(/-(\d+)\.webp$/.exec(load(w))?.[1])),
    );
    for (const w of produced) expect(IMAGE_WIDTHS).toContain(w);
  });
});
