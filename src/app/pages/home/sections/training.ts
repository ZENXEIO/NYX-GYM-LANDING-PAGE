import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../../content/site';
import { ArchFrame } from '../../../shared/arch-frame';
import { Reveal } from '../../../shared/reveal';

/** Training (monsoon): two modes as prose, then the coaches in arch frames. */
@Component({
  selector: 'nyx-training',
  imports: [ArchFrame, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="training" class="section-y bg-monsoon" aria-labelledby="training-title">
      <div class="site-container">
        <h2 id="training-title" class="text-h2 text-reveal" nyxReveal>{{ training.heading }}</h2>

        <div class="site-grid mt-14 gap-y-10 md:mt-20">
          @for (m of training.modes; track m.title; let first = $first) {
            <div
              class="border-hairline rule-draw col-span-4 border-t pt-6 md:col-span-5"
              [class]="first ? '' : 'md:col-start-7'"
            >
              <h3 class="text-h3">{{ m.title }}</h3>
              <p class="text-body-lg measure text-fg-muted mt-5">{{ m.copy }}</p>
            </div>
          }
        </div>

        <h3 class="text-label text-fg-muted mt-24 md:mt-32">{{ training.coachesHeading }}</h3>
        <ul
          class="carousel-focus -mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:scroll-px-0 md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
          aria-label="Coaches"
        >
          @for (c of training.coaches; track c.name; let odd = $odd) {
            <li
              class="coach-rise w-[72%] shrink-0 snap-start md:w-auto"
              [class]="odd ? 'md:mt-16' : ''"
            >
              <nyx-arch-frame
                [class.coach-drift]="odd"
                [image]="c.image"
                sizes="(min-width: 768px) 22vw, 72vw"
                [action]="{
                  label: 'Book a session with ' + c.name,
                  fragment: 'visit',
                  icon: 'arrow',
                }"
              />
              <p class="text-h3 mt-6 text-[1.25rem]">{{ c.name }}</p>
              <p class="text-label text-accent mt-2">{{ c.speciality }}</p>
              <p class="text-fg-muted mt-3 max-w-[34ch]">{{ c.bio }}</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class Training {
  protected readonly training = site.training;
}
