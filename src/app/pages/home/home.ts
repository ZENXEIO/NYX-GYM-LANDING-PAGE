import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../core/seo.service';
import { site } from '../../content/site';
import { Club } from './sections/club';
import { Facilities } from './sections/facilities';
import { Hero } from './sections/hero';
import { Membership } from './sections/membership';
import { Testimonials } from './sections/testimonials';
import { Training } from './sections/training';
import { Visit } from './sections/visit';

@Component({
  selector: 'nyx-home',
  imports: [Hero, Club, Facilities, Training, Membership, Testimonials, Visit],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // On first load, below-the-fold sections are prerendered as HTML and only
  // hydrate (load their JS) when scrolled into view ("hydrate on viewport").
  // Early clicks are replayed by event replay. Testimonials never hydrate.
  // "on immediate" applies only when the homepage is reached by client-side
  // navigation (e.g. the menu from /privacy): every section renders straight
  // away, so a jump to #membership lands without the page shifting under it.
  template: `
    <nyx-hero />
    @defer (on immediate; hydrate on viewport) {
      <nyx-club />
    } @placeholder {
      <div class="bg-plaster min-h-svh"></div>
    }
    @defer (on immediate; hydrate on viewport) {
      <nyx-facilities />
    } @placeholder {
      <div class="min-h-svh"></div>
    }
    @defer (on immediate; hydrate on viewport) {
      <nyx-training />
    } @placeholder {
      <div class="bg-monsoon min-h-svh"></div>
    }
    <!-- Also hydrates on a tap, so "Enquire" always runs its handler. -->
    @defer (on immediate; hydrate on viewport; hydrate on interaction) {
      <nyx-membership />
    } @placeholder {
      <div class="bg-plaster min-h-svh"></div>
    }
    @defer (on immediate; hydrate never) {
      <nyx-testimonials />
    } @placeholder {
      <div class="min-h-[50svh]"></div>
    }
    <nyx-visit />
  `,
})
export class Home {
  constructor() {
    inject(SeoService).set({ ...site.seo.home, path: '/' });
  }
}
