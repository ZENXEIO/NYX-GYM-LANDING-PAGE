import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../../content/site';
import { Photo } from '../../../shared/photo';
import { Reveal } from '../../../shared/reveal';

/**
 * Facilities (dark): six alternating rows. Each image bleeds to the viewport
 * edge on its side; two lines of copy sit opposite. No numbering.
 */
@Component({
  selector: 'nyx-facilities',
  imports: [Photo, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="facilities" class="section-y bg-basalt" aria-labelledby="facilities-title">
      <div class="site-container site-grid">
        <div class="col-span-4 md:col-span-8 lg:col-span-7">
          <h2 id="facilities-title" class="text-h2 text-reveal" nyxReveal>
            {{ facilities.heading }}
          </h2>
          <p class="text-body-lg measure text-fg-muted mt-8">{{ facilities.intro }}</p>
        </div>
      </div>

      <div class="mt-20 flex flex-col gap-24 md:mt-28 md:gap-36">
        @for (f of facilities.items; track f.id; let odd = $odd) {
          <article
            class="grid grid-cols-1 items-end gap-y-8 md:grid-cols-12 md:gap-x-6"
            [attr.aria-labelledby]="'facility-' + f.id"
          >
            <figure
              class="photo-reveal photo-hover lights-on relative aspect-[3/2] overflow-hidden"
              [class]="odd ? 'md:col-span-7 md:col-start-6' : 'md:col-span-7 md:col-start-1'"
              nyxReveal
            >
              <nyx-photo
                class="absolute inset-0"
                [image]="f.image"
                sizes="(min-width: 768px) 58vw, 100vw"
                [parallax]="true"
              />
            </figure>
            <div
              class="caption-follow px-4 md:row-start-1 md:px-0"
              nyxReveal
              [class]="
                odd ? 'md:col-span-4 md:col-start-2' : 'md:col-span-4 md:col-start-9 md:pr-10'
              "
            >
              <h3 [id]="'facility-' + f.id" class="text-h3">{{ f.name }}</h3>
              <p class="text-fg-muted mt-4">
                {{ f.lines[0] }}<br />
                {{ f.lines[1] }}
              </p>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class Facilities {
  protected readonly facilities = site.facilities;
}
