import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Fallback reveal for browsers without CSS scroll-driven animations.
 * Where `animation-timeline: view()` is supported, CSS does the work and this
 * directive does nothing. Content is never hidden without JS or with reduced motion.
 */
@Directive({ selector: '[nyxReveal]' })
export class Reveal {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!shouldUseFallback(el)) return;
      el.classList.add('reveal-pending');
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            el.classList.add('reveal-in');
            io.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}

/**
 * Hide-then-reveal only when: CSS scroll timelines are unsupported, motion is
 * allowed, IntersectionObserver exists, and the element starts below the fold.
 * Missing APIs mean "do nothing", so content always stays visible.
 */
export function shouldUseFallback(el: HTMLElement): boolean {
  if (typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()')) return false;
  if (typeof matchMedia !== 'function') return false;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (typeof IntersectionObserver === 'undefined') return false;
  return el.getBoundingClientRect().top >= window.innerHeight;
}
