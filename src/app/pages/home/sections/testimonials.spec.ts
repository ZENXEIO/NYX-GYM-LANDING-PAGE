import { site } from '../../../content/site';
import { render } from '../../../testing/render';
import { Testimonials } from './testimonials';

describe('Testimonials section', () => {
  it('has its heading', async () => {
    const { q } = await render(Testimonials);
    expect(q('h2#testimonials-title')!.textContent?.trim()).toBe(site.testimonials.heading);
  });

  it('shows one dashed placeholder per slot, each clearly labelled', async () => {
    const { qa } = await render(Testimonials);
    const slots = qa('li');
    expect(slots).toHaveLength(site.testimonials.slots);
    for (const s of slots) {
      expect(s.classList).toContain('border-dashed');
      expect(s.textContent).toContain('Placeholder');
      expect(s.textContent).toMatch(/member name, member since year/i);
    }
  });

  it('never invents a real-looking member quote or name', async () => {
    const { text } = await render(Testimonials);
    expect(text()).not.toMatch(/“|”|"/);
  });
});
