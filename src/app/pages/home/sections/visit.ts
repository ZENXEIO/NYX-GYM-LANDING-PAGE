import { ChangeDetectionStrategy, Component, afterNextRender, signal } from '@angular/core';
import { site } from '../../../content/site';
import { mumbaiNow } from '../../../core/open-status';
import { MapEmbed } from './map-embed';
import { TourForm } from './tour-form';

/** Visit (dark): address, hours, contact, click-to-load map and the tour form. */
@Component({
  selector: 'nyx-visit',
  imports: [MapEmbed, TourForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="visit" class="section-y bg-basalt" aria-labelledby="visit-title">
      <div class="site-container site-grid gap-y-16">
        <div class="col-span-4 md:col-span-5">
          <h2 id="visit-title" class="text-h2">{{ v.heading }}</h2>
          <p class="text-body-lg measure text-fg-muted mt-8">{{ v.intro }}</p>

          <dl class="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <dt class="text-label text-fg-muted">{{ v.addressHeading }}</dt>
              <dd class="mt-3">
                <address class="not-italic">
                  @for (line of contact.addressLines; track line) {
                    <span class="block">{{ line }}</span>
                  }
                </address>
              </dd>
            </div>
            <div>
              <dt class="text-label text-fg-muted">{{ v.contactHeading }}</dt>
              <dd class="mt-1 flex flex-col">
                <a class="link-line link-tap w-fit" [href]="contact.phoneHref">{{
                  contact.phoneDisplay
                }}</a>
                <a
                  class="link-line link-tap w-fit"
                  [href]="contact.whatsappHref"
                  rel="noopener"
                  target="_blank"
                  >WhatsApp</a
                >
                <a class="link-line link-tap w-fit" [href]="'mailto:' + contact.email">{{
                  contact.email
                }}</a>
              </dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-label text-fg-muted">{{ v.hoursHeading }}</dt>
              <dd class="mt-3">
                <ul class="divide-line border-line divide-y border-y">
                  @for (h of hours; track h.days) {
                    <li
                      class="relative flex items-baseline justify-between gap-4 py-3"
                      [class.is-today]="h.dayNumbers.includes(today())"
                    >
                      <span class="flex items-baseline gap-3">
                        {{ h.days }}
                        @if (h.dayNumbers.includes(today())) {
                          <span class="text-label text-accent inline-flex items-center gap-2">
                            <span
                              class="live-dot bg-bronze size-1.5 rounded-full"
                              aria-hidden="true"
                            ></span>
                            {{ todayLabel }}
                          </span>
                        }
                      </span>
                      <span class="text-fg-muted tabular-nums">{{ h.time }}</span>
                    </li>
                  }
                </ul>
              </dd>
            </div>
          </dl>

          <nyx-map-embed class="mt-12" [query]="contact.mapQuery" [label]="v.mapLabel" />
        </div>

        <div class="col-span-4 md:col-span-6 md:col-start-7">
          @defer (on viewport; hydrate on viewport) {
            <nyx-tour-form />
          } @placeholder {
            <div class="border-line min-h-[640px] border p-6 md:p-10">
              <p class="text-h3">{{ v.form.heading }}</p>
              <p class="text-fg-muted mt-4">
                {{ v.form.loadingCall }}
                <a class="link-line" [href]="contact.phoneHref">{{ contact.phoneDisplay }}</a>.
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    /* Today's row: a bronze marker grows down its left edge (CLAUDE.md §4). */
    .is-today::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 12px;
      bottom: 12px;
      width: 1px;
      background: var(--color-bronze);
      transform-origin: top;
    }
    @media (prefers-reduced-motion: no-preference) {
      .is-today::before {
        animation: today-mark 1400ms var(--ease-calm) both;
      }
      @supports (animation-timeline: view()) {
        .is-today::before {
          animation: today-mark linear both;
          animation-timeline: view();
          animation-range: entry 40% cover 40%;
        }
      }
      /* The same slow breath as the hero's "open now" dot. */
      .live-dot {
        animation: today-breathe 2400ms var(--ease-calm) infinite alternate;
      }
    }
    @keyframes today-mark {
      from {
        transform: scaleY(0);
      }
      to {
        transform: none;
      }
    }
    @keyframes today-breathe {
      from {
        opacity: 0.35;
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export class Visit {
  protected readonly v = site.visit;
  protected readonly contact = site.contact;
  protected readonly hours = site.hours;
  protected readonly todayLabel = site.status.today;
  /** Mumbai day of the week; -1 until the browser renders (prerendered HTML marks no day). */
  protected readonly today = signal(-1);

  constructor() {
    afterNextRender(() => this.today.set(mumbaiNow(new Date()).day));
  }
}
