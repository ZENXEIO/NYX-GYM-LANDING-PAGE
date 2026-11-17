import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../../content/site';

/** Testimonials (dark): clearly marked placeholders until real member quotes arrive. */
@Component({
  selector: 'nyx-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section-y bg-basalt" aria-labelledby="testimonials-title">
      <div class="site-container">
        <h2 id="testimonials-title" class="text-h2">{{ t.heading }}</h2>
        <ul class="site-grid mt-14 gap-y-6 md:mt-20">
          @for (slot of slots; track slot; let first = $first) {
            <li
              class="border-line col-span-4 flex min-h-64 flex-col justify-between border border-dashed p-8 md:col-span-5 md:min-h-80 md:p-10"
              [class]="first ? '' : 'md:col-start-7 md:mt-20'"
            >
              <p class="text-label text-accent">Placeholder</p>
              <p class="text-editorial text-fg-muted text-[clamp(1.5rem,1.2rem+1vw,2rem)]">
                Member quote goes here, one or two sentences, set in Bodoni.
              </p>
              <p class="text-label text-fg-muted">Member name, member since year</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class Testimonials {
  protected readonly t = site.testimonials;
  protected readonly slots = Array.from({ length: site.testimonials.slots }, (_, i) => i);
}
