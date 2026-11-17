import { site } from '../content/site';
import { render } from '../testing/render';
import { Footer } from './footer';

describe('Footer', () => {
  it('is a contentinfo landmark with the wordmark linking home', async () => {
    const { q } = await render(Footer);
    expect(q('footer')).toBeTruthy();
    expect(q('a[aria-label="NYX, home"]')!.getAttribute('href')).toBe('/');
  });

  it('shows the address and labels it as a placeholder until it is real', async () => {
    const { q, text } = await render(Footer);
    for (const line of site.contact.addressLines) expect(q('address')!.textContent).toContain(line);
    expect(text()).toContain('Placeholder address');
  });

  it('links phone, email, WhatsApp and Instagram', async () => {
    const { q } = await render(Footer);
    expect(q(`a[href="${site.contact.phoneHref}"]`)).toBeTruthy();
    expect(q(`a[href="mailto:${site.contact.email}"]`)).toBeTruthy();
    expect(q(`a[href="${site.contact.whatsappHref}"]`)).toBeTruthy();
    expect(q(`a[href="${site.contact.instagram}"]`)).toBeTruthy();
  });

  it('opens external links in a new tab without leaking window.opener', async () => {
    const { qa } = await render(Footer);
    const external = qa<HTMLAnchorElement>('a[target="_blank"]');
    expect(external.length).toBe(2);
    for (const a of external) expect(a.rel).toContain('noopener');
  });

  it('links to the legal pages', async () => {
    const { qa } = await render(Footer);
    const hrefs = qa<HTMLAnchorElement>('a').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/privacy');
    expect(hrefs).toContain('/terms');
  });

  it('shows the current year in the copyright line', async () => {
    const { text } = await render(Footer);
    expect(text()).toContain(`© ${new Date().getFullYear()} NYX`);
  });

  it('uses section headings for its columns (heading order under the page)', async () => {
    const { qa } = await render(Footer);
    expect(qa('h2').map((h) => h.textContent?.trim())).toEqual(['Visit', 'Contact']);
  });
});
