import { SiteImage } from '../content/site';
import { render } from '../testing/render';
import { ArchAction, ArchFrame } from './arch-frame';

const image: SiteImage = {
  alt: 'Portrait of coach Naina Kapoor',
  label: 'Coach portrait',
  spec: '4:5',
};
const action: ArchAction = { label: 'Book a session with Naina', fragment: 'visit', icon: 'arrow' };

describe('ArchFrame', () => {
  it('frames the photo in the arch shape at 4:5', async () => {
    const { q } = await render(ArchFrame, { inputs: { image } });
    const photo = q('nyx-photo')!;
    expect(photo.classList).toContain('arch-frame');
    expect(photo.classList).toContain('aspect-[4/5]');
    expect(photo.classList).toContain('relative');
  });

  it('has no round button unless an action is given', async () => {
    const { q } = await render(ArchFrame, { inputs: { image } });
    expect(q('a.btn-round')).toBeNull();
  });

  it('renders the notch button as a labelled link to the section (never a bare arrow)', async () => {
    const { q } = await render(ArchFrame, { inputs: { image, action } });
    const a = q<HTMLAnchorElement>('a.btn-round')!;
    expect(a.getAttribute('aria-label')).toBe('Book a session with Naina');
    expect(a.title).toBe('Book a session with Naina');
    expect(a.getAttribute('href')).toBe('/#visit');
    expect(a.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws a chevron for "down" and a diagonal arrow for "arrow"', async () => {
    const down = await render(ArchFrame, {
      inputs: { image, action: { ...action, icon: 'down' } },
    });
    expect(down.q('path')!.getAttribute('d')).toBe('M4 7l5 5 5-5');
  });

  it('uses the diagonal arrow icon for "arrow"', async () => {
    const { q } = await render(ArchFrame, { inputs: { image, action } });
    expect(q('path')!.getAttribute('d')).toContain('M5 13L13 5');
  });
});
