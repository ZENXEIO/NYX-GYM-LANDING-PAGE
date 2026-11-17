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
  // Below the fold, sections are prerendered as HTML but only hydrate (load
  // their JS) when scrolled into view. Early clicks are replayed by event replay.
  // Testimonials are static, so they never hydrate. Placeholders only show on
  // client-side navigation back to the homepage.
  template: `
    <nyx-hero />
    @defer (on viewport; hydrate on viewport) {
      <nyx-club />
    } @placeholder {
      <div class="bg-plaster min-h-svh"></div>
    }
    @defer (on viewport; hydrate on viewport) {
      <nyx-facilities />
    } @placeholder {
      <div class="min-h-svh"></div>
    }
    @defer (on viewport; hydrate on viewport) {
      <nyx-training />
    } @placeholder {
      <div class="bg-monsoon min-h-svh"></div>
    }
    @defer (on viewport; hydrate on viewport) {
      <nyx-membership />
    } @placeholder {
      <div class="bg-plaster min-h-svh"></div>
    }
    @defer (on viewport; hydrate never) {
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
