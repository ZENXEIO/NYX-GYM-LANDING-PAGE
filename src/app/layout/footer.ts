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
 * Footer with the closing moment (CLAUDE.md §4, element 7): as the footer
 * scrolls in, the Queen's Necklace draws itself towards a bronze button and its
 * lights come on one by one; once it closes, the sign-off writes itself in.
 * Pressing the button slides an invitation card up from behind the footer.
 *
 * The scroll part is CSS only: a view timeline animates `--p` from 0 to 1 and
 * everything reads from it. Without scroll timelines, or with reduced motion,
 * `--p` stays at 1 and the footer shows complete.
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
          <div class="stage relative h-[28rem] md:h-[34rem]">
            <p class="sign-off text-h2 text-plaster max-w-[11ch] pt-20 md:pt-32">
              {{ f.signOff }}
            </p>

            <div class="absolute inset-x-0 bottom-0">
              @for (n of necklaces; track n.viewBox) {
                <svg
                  [attr.viewBox]="n.viewBox"
                  fill="none"
                  aria-hidden="true"
                  class="drawing block h-auto w-full overflow-visible"
                  [class]="n === wide ? 'hidden md:block' : 'md:hidden'"
                >
                  <path
                    class="necklace-line"
                    [attr.d]="n.d"
                    pathLength="1"
                    stroke="currentColor"
                    stroke-width="1"
                    vector-effect="non-scaling-stroke"
                  />
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

              <!-- The clasp: where the necklace ends -->
              <div
                class="clasp absolute z-20"
                [style.--nx]="narrow.end.left"
                [style.--ny]="narrow.end.top"
                [style.--wx]="wide.end.left"
                [style.--wy]="wide.end.top"
              >
                <span class="clasp-label text-label text-plaster-muted" aria-hidden="true">{{
                  f.invitation.label
                }}</span>
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
              </div>
            </div>

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
    /* --p: how far the necklace has closed, 0 to 1. Complete by default. */
    @property --p {
      syntax: '<number>';
      inherits: true;
      initial-value: 1;
    }
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        .necklace {
          animation: necklace-close linear both;
          animation-timeline: view();
          animation-range: entry 10% cover 50%;
        }
      }
    }
    @keyframes necklace-close {
      from {
        --p: 0;
      }
      to {
        --p: 1;
      }
    }
    .necklace {
      /* The line draws over the first 85%; the sign-off writes in over the last 25%. */
      --draw: clamp(0, var(--p) / 0.85, 1);
      --sign: clamp(0, (var(--p) - 0.75) / 0.25, 1);
    }

    .drawing {
      color: var(--color-bronze);
      transition: opacity 900ms var(--ease-calm);
    }
    .necklace-line {
      stroke-dasharray: 1;
      stroke-dashoffset: calc(1 - var(--draw));
    }
    /* Each streetlight comes on as the line reaches it. */
    .lamp {
      fill: var(--color-bronze-light);
      opacity: clamp(0.12, (var(--draw) - var(--at)) * 14 + 0.12, 1);
    }

    .sign-off {
      clip-path: inset(-20% calc((1 - var(--sign)) * 100%) -20% 0);
    }

    /* Sits on the end of the curve: percentages of the drawing's box. */
    .clasp {
      left: var(--nx);
      top: var(--ny);
      translate: -50% -50%;
    }
    @media (min-width: 768px) {
      .clasp {
        left: var(--wx);
        top: var(--wy);
      }
    }
    .clasp-btn {
      position: relative;
      /* Brightens once the necklace has closed. */
      border-color: color-mix(
        in srgb,
        var(--color-bronze-light) calc(var(--sign) * 100%),
        var(--color-bronze)
      );
    }
    .clasp-label {
      position: absolute;
      right: calc(100% + 16px);
      top: 50%;
      translate: 0 -50%;
      white-space: nowrap;
      opacity: var(--sign);
      transition: opacity 900ms var(--ease-calm);
    }
    .clasp-icon {
      transition: rotate 900ms var(--ease-calm);
    }

    /* The card: hidden behind the contact panel; its top edge peeks out once
       the necklace has closed; slides fully up when opened. */
    .card {
      inset-inline: 0;
      translate: 0 calc(100% - 22px * var(--sign));
      transition: translate 1100ms var(--ease-calm);
    }
    @media (min-width: 768px) {
      /* Beside the clasp, never under it. */
      .card {
        inset-inline: auto 5.5rem;
        width: 34rem;
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
    /* Phones: the open card fills the stage, so the clasp steps aside; the
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
    .is-open .clasp-label {
      opacity: 0;
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
