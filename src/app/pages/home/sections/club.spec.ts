import { site } from '../../../content/site';
import { render } from '../../../testing/render';
import { Club } from './club';

describe('Club section', () => {
  it('is the #club anchor on a light (plaster) surface', async () => {
    const { q } = await render(Club);
    const s = q('section')!;
    expect(s.id).toBe('club');
    expect(s.getAttribute('data-surface')).toBe('light');
    expect(s.classList).toContain('bg-plaster');
    expect(s.getAttribute('aria-labelledby')).toBe('club-title');
  });

  it('has a sentence-case h2 and the story paragraphs', async () => {
    const { q, qa } = await render(Club);
    expect(q('h2#club-title')!.textContent?.trim()).toBe(site.club.heading);
    expect(qa('p').map((p) => p.textContent?.trim())).toEqual(
      expect.arrayContaining(site.club.paragraphs),
    );
  });

  it('shows the single stat: "150" with its caption', async () => {
    const { q, text } = await render(Club);
    expect(q('.text-editorial')!.textContent?.trim()).toBe('150');
    expect(text()).toContain('members. Never more.');
  });

  it('frames the portrait in an arch with a labelled button to the facilities', async () => {
    const { q } = await render(Club);
    expect(q('nyx-arch-frame')).toBeTruthy();
    const btn = q<HTMLAnchorElement>('a.btn-round')!;
    expect(btn.getAttribute('aria-label')).toBe(site.club.action.label);
    expect(btn.getAttribute('href')).toBe('/#facilities');
  });
});
