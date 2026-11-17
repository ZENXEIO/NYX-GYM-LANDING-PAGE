import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../../content/site';
import { ArchFrame } from '../../../shared/arch-frame';
import { Reveal } from '../../../shared/reveal';

/** The Club (plaster): story, the single stat, and the arch-framed portrait. */
@Component({
  selector: 'nyx-club',
  imports: [ArchFrame, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="club"
      data-surface="light"
      class="section-y bg-plaster"
      aria-labelledby="club-title"
    >
      <div class="site-container site-grid items-end gap-y-16">
        <div class="col-span-4 md:col-span-6 lg:col-span-5">
          <h2 id="club-title" class="text-h2 text-reveal" nyxReveal>{{ club.heading }}</h2>
          <div class="text-body-lg measure text-fg-muted mt-10 flex flex-col gap-6">
            @for (p of club.paragraphs; track $index) {
              <p>{{ p }}</p>
            }
          </div>

          <div class="border-hairline mt-14 flex items-baseline gap-5 border-t pt-8">
            <span class="text-editorial text-fg text-[clamp(3.5rem,2.4rem+4vw,6rem)]">{{
              club.stat.value
            }}</span>
            <span class="text-body-lg text-fg-muted">{{ club.stat.caption }}</span>
          </div>
        </div>

        <nyx-arch-frame
          class="col-span-4 md:col-span-5 md:col-start-8"
          [image]="club.image"
          sizes="(min-width: 768px) 38vw, 92vw"
          [action]="{ label: club.action.label, fragment: club.action.fragment, icon: 'down' }"
        />
      </div>
    </section>
  `,
})
export class Club {
  protected readonly club = site.club;
}
