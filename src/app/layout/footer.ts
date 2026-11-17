import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { site } from '../content/site';
import { Arc } from '../shared/arc';
import { NARROW_NECKLACE, WIDE_NECKLACE } from './necklace';

/**
 * Footer with the closing moment (CLAUDE.md §4): as the footer scrolls in, the
 * Queen's Necklace, hung from the footer's top hairline, draws itself in from
 * both edges and its lights come on one by one towards the middle, where the
 * halves meet at a bronze pendant button. Then the sign-off writes itself in.
 * Pressing the button slides an invitation card up from behind the footer.
 *
 * The scroll part is CSS only: each piece animates its own opacity or
 * transform on the necklace's view timeline. Without scroll timelines, or with
 * reduced motion, the footer shows complete.
 */
@Component({
  selector: 'nyx-footer',
  imports: [RouterLink, Arc],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer bg-basalt" [class.is-open]="open()">
      <!-- The closing moment -->
      <div class="necklace border-line border-t">
        <div class="site-container">
          <div class="stage relative pb-44 md:pb-[13.5rem] lg:pb-48">
            <!-- Hung from the hairline: the drawing's top edge is the border. -->
            <div class="relative">
              @for (n of necklaces; track n.viewBox) {
                <svg
                  [attr.viewBox]="n.viewBox"
                  fill="none"
                  aria-hidden="true"
                  class="drawing block h-auto w-full overflow-visible"
                  [class]="n === wide ? 'hidden md:block' : 'md:hidden'"
                >
                  @for (d of n.paths; track $index) {
                    <path
                      class="necklace-line"
                      [attr.d]="d"
                      pathLength="1"
                      stroke="currentColor"
                      stroke-width="1"
                      vector-effect="non-scaling-stroke"
                    />
                  }
                  @for (l of n.lights; track $index) {
                    <circle
                      class="lamp"
                      [attr.cx]="l.x"
                      [attr.cy]="l.y"
                      [attr.r]="n === wide ? 2.4 : 2"
                      [style.--at]="l.at"
                    />
                  }
                </svg>
              }

              <!-- The pendant: where the two halves meet -->
              <div
                class="clasp absolute z-20"
                [style.--nx]="narrow.end.left"
                [style.--ny]="narrow.end.top"
                [style.--wx]="wide.end.left"
                [style.--wy]="wide.end.top"
              >
                <button
                  #clasp
                  type="button"
                  class="btn-round clasp-btn bg-basalt"
                  [attr.aria-label]="open() ? f.invitation.close : f.invitation.open"
                  [attr.aria-expanded]="open()"
                  aria-controls="footer-invitation"
                  (click)="toggle()"
                >
                  <svg
                    class="clasp-icon"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    aria-hidden="true"
                  >
                    <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.2" />
                  </svg>
                </button>
                <span class="clasp-label text-label text-plaster-muted" aria-hidden="true">{{
                  f.invitation.label
                }}</span>
              </div>
            </div>

            <p
              class="sign-off text-h2 text-plaster mx-auto mt-28 max-w-[14ch] text-center md:mt-32"
            >
              {{ f.signOff }}
            </p>

            <!-- The invitation, tucked behind the footer until opened -->
            <div
              #card
              id="footer-invitation"
              tabindex="-1"
              class="card invitation-frame absolute bottom-0 z-0 px-8 py-9 text-center md:px-12 md:py-11"
              data-surface="light"
              role="region"
              [attr.aria-label]="f.invitation.title"
              [attr.inert]="open() ? null : ''"
              (keydown.escape)="close()"
            >
              <nyx-arc class="mx-auto w-16" />
              <p class="text-ink mt-4 font-serif text-[2rem] leading-[1.1] md:text-[2.5rem]">
                {{ f.invitation.title }}
              </p>
              <p class="text-ink-muted mx-auto mt-4 max-w-[36ch]">{{ f.invitation.text }}</p>
              <div class="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <a
                  class="btn min-h-11 px-6"
                  routerLink="/"
                  fragment="visit"
                  (click)="close(false)"
                  >{{ f.invitation.cta }}</a
                >
                <a class="link-line text-ink" [href]="site.contact.phoneHref">{{
                  site.contact.phoneDisplay
                }}</a>
                <button
                  type="button"
                  class="text-label link-line text-ink-muted min-h-11"
                  (click)="close()"
                >
                  {{ f.invitation.dismiss }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact details. Opaque and above the card, which hides behind it. -->
      <div class="bg-basalt border-line relative z-10 border-t pt-16 pb-10 md:pt-20">
        <div class="site-container">
          <div class="site-grid gap-y-12">
            <div class="col-span-4 md:col-span-5">
              <a routerLink="/" class="wordmark text-[2rem]" aria-label="NYX, home">NYX</a>
              <p class="text-plaster-muted mt-6 max-w-[32ch]">{{ f.tagline }}</p>
            </div>

            <div class="col-span-2 md:col-span-3 md:col-start-7">
              <h2 class="text-label text-plaster-muted">Visit</h2>
              <address class="mt-4 not-italic">
                @for (line of site.contact.addressLines; track line) {
                  <span class="block">{{ line }}</span>
                }
              </address>
            </div>

            <div class="col-span-2 md:col-span-3">
              <h2 class="text-label text-plaster-muted">Contact</h2>
              <ul class="mt-4 flex flex-col gap-2">
                <li>
                  <a class="link-line" [href]="site.contact.phoneHref">{{
                    site.contact.phoneDisplay
                  }}</a>
                </li>
                <li>
                  <a class="link-line" [href]="'mailto:' + site.contact.email">{{
                    site.contact.email
                  }}</a>
                </li>
                <li>
                  <a
                    class="link-line"
                    [href]="site.contact.whatsappHref"
                    rel="noopener"
                    target="_blank"
                    >WhatsApp</a
                  >
                </li>
                <li>
                  <a
                    class="link-line"
                    [href]="site.contact.instagram"
                    rel="noopener"
                    target="_blank"
                    >Instagram</a
                  >
                </li>
              </ul>
            </div>
          </div>

          <div
            class="border-line text-plaster-muted mt-20 flex flex-col gap-4 border-t pt-6 text-sm md:flex-row md:items-center md:justify-between"
          >
            <p>© {{ year }} NYX. All rights reserved.</p>
            <ul class="flex gap-6">
              @for (l of f.legal; track l.path) {
                <li>
                  <a class="link-line" [routerLink]="l.path">{{ l.label }}</a>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: `
    /* Scroll-linked, part by part. Every piece animates its own opacity or
       transform on the necklace's view timeline, where the moment runs from
       cover 5% to cover 50% ("p" 0 to 1 below): the halves draw over p 0–0.85,
       each lamp lights as the line reaches it, and the sign-off, the
       pendant's brighter ring, its label and the card's peek arrive over
       p 0.75–1. (One inherited --p used to restyle the whole footer on every
       scroll frame.) Without scroll timelines, or with reduced motion,
       nothing animates and the footer shows complete. */
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        .necklace {
          view-timeline-name: --necklace;
        }
        .necklace-line,
        .lamp,
        .sign-off::after,
        .clasp-btn::after,
        .clasp-label,
        .card {
          animation: fade-in linear both;
          animation-timeline: --necklace;
          animation-range: cover 38.75% cover 50%;
        }
        .necklace-line {
          stroke-dasharray: 1;
          animation-name: line-draw;
          animation-range: cover 5% cover 43.25%;
        }
        /* p = 0.85 × at, so cover 5% + 38.25% × at. */
        .lamp {
          animation-name: lamp-on;
          animation-range: cover calc(5% + 38.25% * var(--at)) cover calc(7.4% + 38.25% * var(--at));
        }
        /* Written in from the left: a basalt panel slides off to the right. */
        .sign-off::after {
          content: '';
          position: absolute;
          inset: -0.15em -0.1em;
          background: var(--color-basalt);
          transform-origin: right;
          transform: scaleX(0);
          animation-name: sign-wipe;
        }
        .card {
          animation-name: card-peek;
        }
      }
    }
    /* Only start states: each ends on the element's resting (complete) style. */
    @keyframes line-draw {
      from {
        stroke-dashoffset: 1;
      }
    }
    @keyframes lamp-on {
      from {
        opacity: 0.12;
      }
    }
    @keyframes sign-wipe {
      from {
        transform: none;
      }
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
    }
    @keyframes card-peek {
      from {
        transform: translateY(22px);
      }
    }

    .drawing {
      color: var(--color-bronze);
      transition: opacity 900ms var(--ease-calm);
    }
    .lamp {
      fill: var(--color-bronze-light);
    }
    .sign-off {
      position: relative;
    }

    /* Hangs from the lowest point: its top centre is where the halves meet. */
    .clasp {
      left: var(--nx);
      top: var(--ny);
      translate: -50% 0;
    }
    @media (min-width: 768px) {
      .clasp {
        left: var(--wx);
        top: var(--wy);
      }
    }
    .clasp-btn {
      position: relative;
    }
    /* A brighter ring over the bronze one: it fades in as the necklace closes. */
    .clasp-btn::after {
      content: '';
      position: absolute;
      inset: -1px;
      border: 1px solid var(--color-bronze-light);
      border-radius: 9999px;
      pointer-events: none;
    }
    .clasp-label {
      position: absolute;
      left: 50%;
      top: calc(100% + 14px);
      translate: -50% 0;
      white-space: nowrap;
      transition: opacity 900ms var(--ease-calm);
    }
    .clasp-icon {
      transition: rotate 900ms var(--ease-calm);
    }

    /* The card: hidden behind the contact panel; its top edge peeks out once
       the necklace has closed (a transform, animated above); slides fully up
       when opened (translate, a separate property). */
    .card {
      inset-inline: 0;
      translate: 0 calc(100% - 22px);
      transition: translate 1100ms var(--ease-calm);
    }
    @media (min-width: 768px) {
      /* Centred under the pendant. */
      .card {
        width: 34rem;
        margin-inline: auto;
      }
    }
    .card:focus {
      outline: none;
    }
    /* Visible at once when the card closes (so it can take focus); hidden
       only after its fade when the card opens. */
    .clasp {
      transition:
        opacity 900ms var(--ease-calm),
        visibility 0s;
    }
    /* Phones: the open card covers the pendant, so it steps aside; the
       card's own Close button takes over. */
    @media (max-width: 767.98px) {
      .is-open .clasp {
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 900ms var(--ease-calm),
          visibility 0s 900ms;
      }
    }
    .is-open .card {
      translate: 0 -24px;
    }
    .is-open .drawing,
    .is-open .sign-off {
      opacity: 0.2;
    }
    .sign-off {
      transition: opacity 900ms var(--ease-calm);
    }
    .is-open .clasp-icon {
      rotate: 45deg;
    }
    /* Important beats the scroll animation's opacity. */
    .is-open .clasp-label {
      opacity: 0 !important;
    }
    @media (prefers-reduced-motion: reduce) {
      .card,
      .drawing,
      .sign-off,
      .clasp-icon,
      .clasp-label,
      .clasp {
        transition: none;
      }
    }
  `,
})
export class Footer {
  protected readonly site = site;
  protected readonly f = site.footer;
  protected readonly year = new Date().getFullYear();
  protected readonly wide = WIDE_NECKLACE;
  protected readonly narrow = NARROW_NECKLACE;
  protected readonly necklaces = [NARROW_NECKLACE, WIDE_NECKLACE];
  protected readonly open = signal(false);
  private readonly clasp = viewChild.required<ElementRef<HTMLButtonElement>>('clasp');
  private readonly injector = inject(Injector);
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');

  protected toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }
    this.open.set(true);
    // Into the card once it is no longer inert (after render), so screen readers
    // announce it and phones, where the clasp hides, keep a sensible focus.
    afterNextRender(() => this.card().nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }

  /** Close the card; return focus to the clasp unless the visitor is leaving via a link. */
  protected close(refocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    // After render: on phones the clasp is visible again only after the class change.
    if (refocus) {
      afterNextRender(() => this.clasp().nativeElement.focus({ preventScroll: true }), {
        injector: this.injector,
      });
    }
  }
}
