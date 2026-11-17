/**
 * Unit-test environment (jsdom) gaps for browser APIs the app uses.
 * Kept minimal and faithful: real behaviour is covered by the Playwright suite.
 */

// <dialog>.showModal()/close(): jsdom has <dialog> but not the modal API.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

// matchMedia: default "no match". Tests override with `setMatchMedia`.
const mediaMatches = new Map<string, boolean>();
export function setMatchMedia(query: string, matches: boolean): void {
  mediaMatches.set(query, matches);
}
export function resetMatchMedia(): void {
  mediaMatches.clear();
}
Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: mediaMatches.get(query) ?? false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList,
});

// IntersectionObserver: jsdom has none. `@defer (on viewport)` needs one, so
// this stand-in reports every observed element as visible on the next tick.
if (typeof window.IntersectionObserver === 'undefined') {
  class VisibleIO {
    private readonly targets = new Set<Element>();
    constructor(private readonly cb: IntersectionObserverCallback) {}
    observe(target: Element): void {
      this.targets.add(target);
      queueMicrotask(() => {
        if (!this.targets.has(target)) return;
        const entry = {
          isIntersecting: true,
          intersectionRatio: 1,
          target,
        } as IntersectionObserverEntry;
        this.cb([entry], this as unknown as IntersectionObserver);
      });
    }
    unobserve(target: Element): void {
      this.targets.delete(target);
    }
    disconnect(): void {
      this.targets.clear();
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: VisibleIO,
  });
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: VisibleIO,
  });
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}
