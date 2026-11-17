import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AnalyticsService } from './core/analytics.service';

describe('App shell', () => {
  async function setup() {
    const start = vi.fn();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: AnalyticsService, useValue: { start } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement, start };
  }

  it('renders the skip link, header, main landmark and footer in order', async () => {
    const { el } = await setup();
    expect(el.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main');
    expect(el.querySelector('nav[aria-label="Main"]')).toBeTruthy();
    expect(el.querySelector('main#main')).toBeTruthy();
    expect(el.querySelector('footer')).toBeTruthy();

    const order = Array.from(el.children).map((c) => c.tagName.toLowerCase());
    expect(order).toEqual(['a', 'nyx-header', 'main', 'nyx-footer']);
  });

  it('the skip link is the first focusable element', async () => {
    const { el } = await setup();
    const first = el.querySelector('a, button, input, select, textarea, [tabindex]');
    expect(first?.classList).toContain('skip-link');
  });

  it('main is programmatically focusable so the skip link can move focus there', async () => {
    const { el } = await setup();
    expect(el.querySelector('main')!.getAttribute('tabindex')).toBe('-1');
  });

  it('skip link moves focus to main without changing the URL', async () => {
    const { el } = await setup();
    document.body.appendChild(el); // getElementById needs the node in the document
    const main = el.querySelector<HTMLElement>('main')!;
    const scroll = vi.spyOn(main, 'scrollIntoView');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });

    el.querySelector<HTMLAnchorElement>('a.skip-link')!.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(main);
    expect(scroll).toHaveBeenCalled();
    el.remove();
  });

  it('starts analytics once, after the first render in the browser', async () => {
    const { start } = await setup();
    expect(start).toHaveBeenCalledTimes(1);
  });
});
