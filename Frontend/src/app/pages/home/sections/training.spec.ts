import { site } from '../../../content/site';
import { render } from '../../../testing/render';
import { Training } from './training';

describe('Training section', () => {
  it('is the #training anchor on the monsoon surface', async () => {
    const { q } = await render(Training);
    const s = q('section')!;
    expect(s.id).toBe('training');
    expect(s.classList).toContain('bg-monsoon');
  });

  it('describes personal training and small groups as prose', async () => {
    const { qa } = await render(Training);
    const modes = qa('h3.text-h3').map((h) => h.textContent?.trim());
    expect(modes).toEqual(site.training.modes.map((m) => m.title));
  });

  it('lists the coaches with name, speciality and an arch-framed photo', async () => {
    const { qa } = await render(Training);
    const items = qa('ul[aria-label="Coaches"] > li');
    expect(items).toHaveLength(site.training.coaches.length);
    items.forEach((li, i) => {
      const c = site.training.coaches[i];
      expect(li.textContent).toContain(c.name);
      expect(li.textContent).toContain(c.speciality);
      expect(li.querySelector('nyx-arch-frame')).toBeTruthy();
    });
  });

  it('labels each coach’s round button with who it books', async () => {
    const { qa } = await render(Training);
    const labels = qa('a.btn-round').map((a) => a.getAttribute('aria-label'));
    expect(labels).toEqual(site.training.coaches.map((c) => `Book a session with ${c.name}`));
  });

  it('marks placeholder coaches on the page', async () => {
    const { qa } = await render(Training);
    const flagged = site.training.coaches.filter((c) => c.placeholder).length;
    expect(qa('li').filter((li) => li.textContent?.includes('Placeholder coach'))).toHaveLength(
      flagged,
    );
  });

  it('scrolls sideways with snap on mobile and becomes a grid on wider screens', async () => {
    const { q } = await render(Training);
    const ul = q('ul[aria-label="Coaches"]')!;
    for (const c of ['overflow-x-auto', 'snap-x', 'snap-mandatory', 'scroll-px-4', 'md:grid']) {
      expect(ul.classList).toContain(c);
    }
  });
});
