import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EnquiryState } from '../../../core/enquiry.state';
import { TierId, site } from '../../../content/site';
import { Arc } from '../../../shared/arc';
import { Reveal } from '../../../shared/reveal';

/** Membership (plaster): three tiers as invitations on cream card. No prices. */
@Component({
  selector: 'nyx-membership',
  imports: [Arc, RouterLink, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="membership"
      data-surface="light"
      class="section-y bg-plaster"
      aria-labelledby="membership-title"
    >
      <div class="site-container">
        <div class="mx-auto max-w-[44rem] text-center">
          <h2 id="membership-title" class="text-h2 text-reveal" nyxReveal>{{ m.heading }}</h2>
          <p class="text-body-lg text-fg-muted mt-8">{{ m.intro }}</p>
        </div>

        <ul class="mt-16 grid gap-6 md:mt-24 md:grid-cols-3 md:items-start">
          @for (t of m.tiers; track t.id; let i = $index) {
            <li
              class="invitation-frame flex flex-col items-center px-8 pt-12 pb-10 text-center md:px-10"
              [class]="i === 1 ? 'md:mt-12' : ''"
            >
              <nyx-arc class="w-20" />
              <h3 class="text-editorial mt-6">{{ t.name }}</h3>
              <p class="text-label text-accent mt-4">{{ t.tagline }}</p>
              <p class="text-fg-muted mt-6 max-w-[30ch]">{{ t.copy }}</p>
              <ul
                class="divide-hairline border-hairline mt-8 w-full divide-y border-y text-[0.9375rem]"
              >
                @for (item of t.includes; track item) {
                  <li class="py-3">{{ item }}</li>
                }
              </ul>
              <a
                routerLink="/"
                fragment="visit"
                class="btn mt-10 w-full"
                [attr.aria-label]="m.cta + ' about ' + t.name + ' membership'"
                (click)="enquire(t.id)"
                >{{ m.cta }}</a
              >
            </li>
          }
        </ul>

        <p class="text-fg-muted mt-12 text-center">{{ m.feesNote }}</p>
      </div>
    </section>
  `,
})
export class Membership {
  protected readonly m = site.membership;
  private readonly enquiry = inject(EnquiryState);

  protected enquire(id: TierId): void {
    this.enquiry.interest.set(id);
  }
}
