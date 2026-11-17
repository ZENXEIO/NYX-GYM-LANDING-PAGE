import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../../content/site';
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
                @if (contact.placeholder) {
                  <span class="text-label text-accent mt-2 block">Placeholder address</span>
                }
              </dd>
            </div>
            <div>
              <dt class="text-label text-fg-muted">{{ v.contactHeading }}</dt>
              <dd class="mt-3 flex flex-col gap-1">
                <a class="link-line w-fit" [href]="contact.phoneHref">{{ contact.phoneDisplay }}</a>
                <a
                  class="link-line w-fit"
                  [href]="contact.whatsappHref"
                  rel="noopener"
                  target="_blank"
                  >WhatsApp</a
                >
                <a class="link-line w-fit" [href]="'mailto:' + contact.email">{{
                  contact.email
                }}</a>
              </dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-label text-fg-muted">{{ v.hoursHeading }}</dt>
              <dd class="mt-3">
                <ul class="divide-line border-line divide-y border-y">
                  @for (h of hours; track h.days) {
                    <li class="flex justify-between gap-4 py-3">
                      <span>{{ h.days }}</span><span class="text-fg-muted tabular-nums">{{
                        h.time
                      }}</span>
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
})
export class Visit {
  protected readonly v = site.visit;
  protected readonly contact = site.contact;
  protected readonly hours = site.hours;
}
