import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../../content/site';

/**
 * Testimonials (dark): member quotes in Bodoni drifting in a slow infinite
 * slider, then a slower counter-drifting row of partner and press logos
 * (ADR 19). CSS only: this section is never hydrated, and the pause toggle is
 * a checkbox, so everything works without JavaScript.
 */
@Component({
  selector: 'nyx-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="testimonials"
      class="marquee-group section-y bg-basalt"
      aria-labelledby="testimonials-title"
    >
      <div class="site-container flex items-end justify-between gap-6">
        <h2 id="testimonials-title" class="text-h2">{{ t.heading }}</h2>
        <label class="marquee-toggle text-label link-line text-plaster-muted mb-2 shrink-0">
          <input type="checkbox" class="sr-only" [attr.aria-label]="t.motion.label" />
          <span class="when-playing" aria-hidden="true">{{ t.motion.pause }}</span>
          <span class="when-paused" aria-hidden="true">{{ t.motion.play }}</span>
        </label>
      </div>

      <!-- Quotes. Four copies; the track moves by half its width, so the loop is
           seamless. Only the first copy is exposed to assistive technology. -->
      <div class="marquee mt-14 md:mt-20" style="--marquee-gap: clamp(2.5rem, 5vw, 5rem)">
        <div class="marquee-track" style="--marquee-duration: 160s">
          @for (copy of copies; track copy) {
            <ul
              class="marquee-set"
              [class.marquee-clone]="copy > 0"
              [attr.aria-label]="copy === 0 ? t.quotesLabel : null"
              [attr.aria-hidden]="copy > 0 ? 'true' : null"
              [attr.inert]="copy > 0 ? '' : null"
            >
              @for (q of t.quotes; track q.name) {
                <li class="marquee-item">
                  <figure class="border-line w-[min(80vw,28rem)] border-t pt-8">
                    <blockquote
                      class="text-editorial text-[clamp(1.5rem,1.15rem+1.2vw,2.25rem)] leading-[1.25]"
                    >
                      <p>“{{ q.quote }}”</p>
                    </blockquote>
                    <figcaption class="mt-8 flex flex-col gap-1">
                      <span class="text-plaster">{{ q.name }}</span>
                      <span class="text-label text-plaster-muted">{{ q.detail }}</span>
                    </figcaption>
                  </figure>
                </li>
              }
            </ul>
          }
        </div>
      </div>

      <div class="site-container mt-24 md:mt-32">
        <h3 class="text-label text-plaster-muted">{{ t.partners.heading }}</h3>
      </div>
      <!-- Partner and press logos: slower, drifting the other way. -->
      <div class="marquee mt-8" style="--marquee-gap: 4rem">
        <div class="marquee-track is-reverse" style="--marquee-duration: 120s">
          @for (copy of copies; track copy) {
            <ul
              class="marquee-set"
              [class.marquee-clone]="copy > 0"
              [attr.aria-label]="copy === 0 ? t.partners.heading : null"
              [attr.aria-hidden]="copy > 0 ? 'true' : null"
              [attr.inert]="copy > 0 ? '' : null"
            >
              @for (p of t.partners.items; track $index) {
                <li class="marquee-item">
                  @if (p.logo) {
                    <img
                      class="partner-logo h-8 w-auto md:h-10"
                      [src]="p.logo"
                      [alt]="p.name"
                      height="40"
                      loading="lazy"
                      decoding="async"
                    />
                  } @else {
                    <span
                      class="border-line text-label text-plaster-muted flex h-16 w-44 flex-col items-center justify-center border text-center"
                    >
                      <span class="text-accent">{{ t.partners.placeholder }}</span>
                      <span class="mt-1 text-[0.625rem]">{{ t.partners.spec }}</span>
                    </span>
                  }
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    /* One-colour partner logos, shown in plaster at reading strength. */
    .partner-logo {
      filter: brightness(0) invert(0.9);
      opacity: 0.7;
      transition: opacity 900ms var(--ease-calm);
    }
    .partner-logo:hover {
      opacity: 1;
    }
  `,
})
export class Testimonials {
  protected readonly t = site.testimonials;

  /** The items are rendered four times; the track moves two copies per loop. */
  protected readonly copies = [0, 1, 2, 3];
}
