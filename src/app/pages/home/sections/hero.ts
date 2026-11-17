import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { site } from '../../../content/site';
import { Arc } from '../../../shared/arc';
import { Photo } from '../../../shared/photo';

/**
 * Hero: full-bleed image/video melting into basalt, embossed monogram,
 * stacked uppercase headline, one CTA with the arc, and the info bar.
 */
@Component({
  selector: 'nyx-hero',
  imports: [Photo, Arc, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="bg-basalt relative isolate flex min-h-svh flex-col overflow-hidden"
      aria-labelledby="hero-title"
    >
      <!-- Media layer -->
      <div class="hero-media absolute inset-0 -z-20">
        <nyx-photo
          class="absolute inset-0"
          [image]="hero.image"
          sizes="100vw"
          [priority]="true"
          [corner]="true"
        />
        @if (showVideo()) {
          <video
            #video
            class="absolute inset-0 h-full w-full object-cover"
            autoplay
            muted
            loop
            playsinline
            preload="none"
            [poster]="hero.image.src ? hero.image.src + '-2400.webp' : null"
            aria-hidden="true"
          >
            <source [src]="hero.video + '.webm'" type="video/webm" />
            <source [src]="hero.video + '.mp4'" type="video/mp4" />
          </video>
        }
      </div>

      <!-- Embossed monogram: decorative relief -->
      <div
        class="hero-monogram emboss pointer-events-none absolute top-[44%] -right-[8vw] -z-10 -translate-y-1/2 font-serif text-[46vw] leading-none select-none md:top-1/2 md:-right-[4vw] md:text-[34vw]"
        aria-hidden="true"
      >
        NYX
      </div>

      <!-- Edge fade: melts the image into the page -->
      <div class="hero-fade pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>

      <div class="site-container flex flex-1 flex-col justify-end pt-32 pb-36 md:pb-40">
        <h1 id="hero-title" class="text-hero text-plaster">
          @for (line of hero.lines; track line) {
            <span class="hero-line block">{{ line }}</span>
          }
        </h1>
        <div class="hero-late mt-10 flex flex-wrap items-center gap-x-6 gap-y-6 md:mt-12">
          <nyx-arc class="w-24 md:w-28" [draw]="true" />
          <a routerLink="/" fragment="visit" class="btn">{{ hero.cta }}</a>
          @if (showVideo()) {
            <button
              type="button"
              class="text-label link-line text-plaster-muted min-h-11"
              (click)="toggleVideo()"
            >
              {{ paused() ? hero.film.play : hero.film.pause }}
            </button>
          }
        </div>
      </div>

      <!-- Info bar -->
      <div class="hero-late absolute inset-x-0 bottom-4 md:bottom-6">
        <div class="site-container">
          <ul
            class="text-label border-line text-plaster-muted flex h-12 items-center justify-between gap-4 rounded-[4px] border px-4 md:h-14 md:px-6"
          >
            <li>{{ site.contact.area }}</li>
            <li class="border-line hidden border-x px-8 md:block">{{ site.hoursShort }}</li>
            <li>
              <a
                class="link-line text-plaster"
                [href]="site.contact.instagram"
                rel="noopener"
                target="_blank"
                >Instagram</a
              >
            </li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero-fade {
      background:
        linear-gradient(to top, var(--color-basalt) 0%, rgb(22 26 29 / 0.55) 30%, transparent 60%),
        linear-gradient(to right, rgb(22 26 29 / 0.7) 0%, transparent 55%);
    }
  `,
})
export class Hero {
  protected readonly site = site;
  protected readonly hero = site.hero;
  protected readonly showVideo = signal(false);
  protected readonly paused = signal(false);
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  constructor() {
    // Video only in the browser, on wide screens, with motion allowed (CLAUDE.md §8).
    afterNextRender(() => {
      const ok =
        !!this.hero.video &&
        matchMedia('(min-width: 1100px)').matches &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.showVideo.set(ok);
    });
  }

  protected toggleVideo(): void {
    const v = this.video()?.nativeElement;
    if (!v) return;
    if (v.paused) {
      this.paused.set(false);
      // play() rejects if the browser refuses playback: show "Play film" again.
      v.play().catch(() => this.paused.set(true));
    } else {
      v.pause();
      this.paused.set(true);
    }
  }
}
