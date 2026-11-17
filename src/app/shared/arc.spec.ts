import { render } from '../testing/render';
import { Arc } from './arc';

describe('Arc', () => {
  it('is decorative: hidden from assistive technology', async () => {
    const { q } = await render(Arc);
    expect(q('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws the Queen’s Necklace curve with seven lights', async () => {
    const { q, qa } = await render(Arc);
    expect(q('path')!.getAttribute('d')).toBe('M2 36 Q60 -10 118 36');
    expect(qa('circle')).toHaveLength(7);
  });

  it('places every light inside the viewBox, symmetrically around the centre', async () => {
    const { qa } = await render(Arc);
    const pts = qa('circle').map((c) => ({
      x: Number(c.getAttribute('cx')),
      y: Number(c.getAttribute('cy')),
    }));
    for (const p of pts) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(120);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(40);
    }
    expect(pts[3].x).toBe(60);
    expect(pts[0].y).toBeCloseTo(pts[6].y, 5);
    expect(pts[0].x + pts[6].x).toBeCloseTo(120, 5);
  });

  it('only animates the line when asked (hero only)', async () => {
    const still = await render(Arc);
    expect(still.q('svg')!.classList).not.toContain('arc-draw');
  });

  it('adds the draw class when draw is true', async () => {
    const { q } = await render(Arc, { inputs: { draw: true } });
    expect(q('svg')!.classList).toContain('arc-draw');
  });

  it('takes its colour from the surface-aware accent token', async () => {
    const { el } = await render(Arc);
    expect(el.classList).toContain('text-accent');
  });
});
