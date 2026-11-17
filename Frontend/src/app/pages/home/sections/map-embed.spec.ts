import { render } from '../../../testing/render';
import { MapEmbed } from './map-embed';

describe('MapEmbed (click to load)', () => {
  const inputs = { query: 'Worli, Mumbai', label: 'Show map' };

  it('makes no third-party request until asked: no iframe on first render', async () => {
    const { q, text } = await render(MapEmbed, { inputs });
    expect(q('iframe')).toBeNull();
    expect(text()).toContain('Worli, Mumbai');
    expect(text()).toContain('Loads Google Maps.');
  });

  it('loads the map when the button is clicked', async () => {
    const { q, stable } = await render(MapEmbed, { inputs });
    q<HTMLButtonElement>('button')!.click();
    await stable();
    const iframe = q<HTMLIFrameElement>('iframe')!;
    expect(iframe).toBeTruthy();
    expect(iframe.title).toBe('Map showing Worli, Mumbai');
    expect(iframe.getAttribute('loading')).toBe('lazy');
    expect(q('button')).toBeNull();
  });

  it('only ever embeds google.com/maps with an encoded query (no injection)', async () => {
    const { q, stable } = await render(MapEmbed, {
      inputs: { query: '"><script>alert(1)</script>&x=1', label: 'Show map' },
    });
    q<HTMLButtonElement>('button')!.click();
    await stable();
    const src = q<HTMLIFrameElement>('iframe')!.src;
    const url = new URL(src);
    expect(url.origin).toBe('https://www.google.com');
    expect(url.pathname).toBe('/maps');
    expect(url.searchParams.get('q')).toBe('"><script>alert(1)</script>&x=1');
    expect(url.searchParams.get('output')).toBe('embed');
    expect(src).not.toContain('<script>');
  });

  it('uses the button label it is given', async () => {
    const { q } = await render(MapEmbed, { inputs: { query: 'x', label: 'View on map' } });
    expect(q('button')!.textContent?.trim()).toBe('View on map');
  });

  it('reserves its space so loading never shifts the layout', async () => {
    const { el } = await render(MapEmbed, { inputs });
    expect(el.classList).toContain('aspect-[4/3]');
  });
});
