import { site } from '../content/site';
import { render } from '../testing/render';
import { Header } from './header';

describe('Header (nav capsule + menu dialog)', () => {
  afterEach(() => {
    document.documentElement.style.overflow = '';
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  async function setup() {
    const r = await render(Header);
    const trigger = r.q<HTMLButtonElement>('button[aria-controls="site-menu"]')!;
    const dialog = r.q<HTMLDialogElement>('dialog#site-menu')!;
    return { ...r, trigger, dialog };
  }

  describe('capsule', () => {
    it('is a labelled navigation landmark with the wordmark linking home', async () => {
      const { q } = await setup();
      expect(q('nav[aria-label="Main"]')).toBeTruthy();
      const home = q<HTMLAnchorElement>('a[aria-label="NYX, home"]')!;
      expect(home.getAttribute('href')).toBe('/');
      expect(home.textContent?.trim()).toBe('NYX');
    });

    it('shows the descriptor and a "Book a tour" link to the form', async () => {
      const { text, qa } = await setup();
      expect(text()).toContain(site.descriptor);
      const book = qa<HTMLAnchorElement>('a').find((a) => a.textContent?.trim() === 'Book a tour');
      expect(book?.getAttribute('href')).toBe('/#visit');
    });

    it('menu trigger exposes its dialog relationship and an accessible name on every size', async () => {
      const { trigger } = await setup();
      expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(trigger.textContent).toContain('Menu'); // sr-only on mobile, visible on desktop
      expect(trigger.className).toMatch(/min-h-11/);
      expect(trigger.className).toMatch(/min-w-11/);
    });

    it('is transparent at the top and turns solid once the page scrolls', async () => {
      const { q, stable } = await setup();
      const nav = q('nav')!;
      expect(nav.classList).not.toContain('is-solid');

      Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
      window.dispatchEvent(new Event('scroll'));
      await stable();
      expect(nav.classList).toContain('is-solid');

      Object.defineProperty(window, 'scrollY', { value: 10, configurable: true });
      window.dispatchEvent(new Event('scroll'));
      await stable();
      expect(nav.classList).not.toContain('is-solid');
    });

    it('stops listening to scroll when destroyed', async () => {
      const remove = vi.spyOn(window, 'removeEventListener');
      const { fixture } = await setup();
      fixture.destroy();
      expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
      remove.mockRestore();
    });
  });

  describe('menu dialog', () => {
    it('opens as a modal, locks page scroll and reports expanded', async () => {
      const { trigger, dialog, stable } = await setup();
      const showModal = vi.spyOn(dialog, 'showModal');
      trigger.click();
      await stable();
      expect(showModal).toHaveBeenCalled();
      expect(dialog.open).toBe(true);
      expect(document.documentElement.style.overflow).toBe('hidden');
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('lists every section link', async () => {
      const { dialog } = await setup();
      const links = Array.from(dialog.querySelectorAll<HTMLAnchorElement>('ul a'));
      expect(links.map((a) => a.textContent?.trim())).toEqual(site.nav.map((n) => n.label));
      expect(links.map((a) => a.getAttribute('href'))).toEqual(
        site.nav.map((n) => `/#${n.fragment}`),
      );
    });

    it('closes from the Close button, unlocks scroll and returns focus to the trigger', async () => {
      const { trigger, dialog, stable } = await setup();
      trigger.click();
      await stable();
      const close = Array.from(dialog.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Close'),
      )!;
      close.click();
      await stable();
      expect(dialog.open).toBe(false);
      expect(document.documentElement.style.overflow).toBe('');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(trigger);
    });

    it('closes when a section link is chosen', async () => {
      const { trigger, dialog, stable } = await setup();
      trigger.click();
      await stable();
      dialog.querySelector<HTMLAnchorElement>('ul a')!.click();
      await stable();
      expect(dialog.open).toBe(false);
      expect(document.activeElement).toBe(trigger);
    });

    it('resets expanded state when cancelled with Esc', async () => {
      const { trigger, dialog, stable } = await setup();
      trigger.click();
      await stable();
      dialog.dispatchEvent(new Event('cancel'));
      dialog.close(); // the browser closes the dialog after "cancel"
      await stable();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(document.documentElement.style.overflow).toBe('');
    });

    it('carries contact details: phone, area and hours, Instagram in a new tab', async () => {
      const { dialog } = await setup();
      const tel = dialog.querySelector<HTMLAnchorElement>('a[href^="tel:"]')!;
      expect(tel.getAttribute('href')).toBe(site.contact.phoneHref);
      expect(dialog.textContent).toContain('open until midnight');
      const ig = dialog.querySelector<HTMLAnchorElement>(`a[href="${site.contact.instagram}"]`)!;
      expect(ig.target).toBe('_blank');
      expect(ig.rel).toContain('noopener');
    });
  });
});
