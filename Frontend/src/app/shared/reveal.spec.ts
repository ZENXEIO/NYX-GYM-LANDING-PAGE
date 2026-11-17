import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resetMatchMedia, setMatchMedia } from '../../test-setup';
import { Reveal, shouldUseFallback } from './reveal';

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

class FakeIO {
  static last: FakeIO | undefined;
  observed: Element[] = [];
  disconnected = false;
  constructor(public cb: IOCallback) {
    FakeIO.last = this;
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
}

function elementAt(top: number): HTMLElement {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({ top }) as DOMRect;
  return el;
}

describe('shouldUseFallback', () => {
  const realIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver;
    // jsdom claims support for everything; model a browser without scroll timelines.
    vi.spyOn(CSS, 'supports').mockReturnValue(false);
  });
  afterEach(() => {
    globalThis.IntersectionObserver = realIO;
    resetMatchMedia();
    vi.restoreAllMocks();
  });

  it('is used for elements below the fold when nothing else handles the reveal', () => {
    expect(shouldUseFallback(elementAt(window.innerHeight + 10))).toBe(true);
  });

  it('is skipped for elements already in view (never hide visible content)', () => {
    expect(shouldUseFallback(elementAt(0))).toBe(false);
  });

  it('is skipped when CSS scroll-driven animations are supported', () => {
    vi.mocked(CSS.supports).mockReturnValue(true);
    expect(shouldUseFallback(elementAt(5000))).toBe(false);
  });

  it('is skipped when the visitor prefers reduced motion', () => {
    setMatchMedia('(prefers-reduced-motion: reduce)', true);
    expect(shouldUseFallback(elementAt(5000))).toBe(false);
  });

  it('is skipped when IntersectionObserver is unavailable', () => {
    globalThis.IntersectionObserver = undefined as unknown as typeof IntersectionObserver;
    expect(shouldUseFallback(elementAt(5000))).toBe(false);
  });
});

@Component({
  imports: [Reveal],
  template: `<p nyxReveal>Text</p>`,
})
class Host {}

describe('Reveal directive', () => {
  const realIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    FakeIO.last = undefined;
    globalThis.IntersectionObserver = FakeIO as unknown as typeof IntersectionObserver;
    // jsdom claims support for everything; model a browser without scroll timelines.
    vi.spyOn(CSS, 'supports').mockReturnValue(false);
  });
  afterEach(() => {
    globalThis.IntersectionObserver = realIO;
    vi.restoreAllMocks();
  });

  async function mount(top: number) {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return { fixture, p: (fixture.nativeElement as HTMLElement).querySelector('p')! };
  }

  it('hides a below-the-fold element, then reveals it once it scrolls into view', async () => {
    const { p } = await mount(window.innerHeight + 200);
    expect(p.classList).toContain('reveal-pending');
    expect(FakeIO.last?.observed).toEqual([p]);

    FakeIO.last!.cb([{ isIntersecting: false }]);
    expect(p.classList).not.toContain('reveal-in');

    FakeIO.last!.cb([{ isIntersecting: true }]);
    expect(p.classList).toContain('reveal-in');
    expect(FakeIO.last!.disconnected).toBe(true);
  });

  it('leaves an in-view element untouched', async () => {
    const { p } = await mount(10);
    expect(p.classList).not.toContain('reveal-pending');
    expect(FakeIO.last).toBeUndefined();
  });

  it('disconnects the observer when destroyed', async () => {
    const { fixture } = await mount(window.innerHeight + 200);
    fixture.destroy();
    expect(FakeIO.last!.disconnected).toBe(true);
  });
});
