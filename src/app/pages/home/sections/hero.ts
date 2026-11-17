import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { site } from '../../../content/site';
import { openStatus } from '../../../core/open-status';
import { Photo } from '../../../shared/photo';

/**
 * Hero: full-bleed image/video melting into basalt, embossed monogram,
 * stacked uppercase headline and the info bar. No CTA button or arc here
 * (removed at the user's request); "Book a tour" lives in the header.
 */
@Component({
  selector: 'nyx-hero',
  imports: [Photo],
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
        <!-- Pause control for the optional hero video (CLAUDE.md §11). -->
        @if (showVideo()) {
          <div class="hero-late mt-10 md:mt-12">
            <button
              type="button"
              class="text-label link-line text-plaster-muted min-h-11"
              (click)="toggleVideo()"
            >
              {{ paused() ? hero.film.play : hero.film.pause }}
            </button>
          </div>
        }
      </div>

      <!-- Info bar -->
      <div class="hero-late absolute inset-x-0 bottom-4 md:bottom-6">
        <div class="site-container">
          <ul
            class="text-label border-line text-plaster-muted flex h-12 items-center justify-between gap-4 rounded-[4px] border px-4 md:h-14 md:px-6"
          >
            <li>{{ site.contact.area }}</li>
            <li class="border-line hidden items-center gap-3 border-x px-8 md:flex">
              @if (status().open) {
                <span class="live-dot bg-bronze size-1.5 rounded-full" aria-hidden="true"></span>
              }
              <span>{{ status().text }}</span>
            </li>
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
        linear-gradient(
          to top,
          var(--color-basalt) 0%,
          color-mix(in srgb, var(--color-basalt) 55%, transparent) 30%,
          transparent 60%
        ),
        linear-gradient(
          to right,
          color-mix(in srgb, var(--color-basalt) 70%, transparent) 0%,
          transparent 55%
        );
    }
    /* Local scrim (CLAUDE.md §11, §17): on phones the headline sits over the
       barbell's chrome highlight, which measured 3.5:1. The taller fade lifts
       it to at least 5.7:1 from 360 to 414px wide. */
    @media (max-width: 767.98px) {
      .hero-fade {
        background:
          linear-gradient(
            to top,
            var(--color-basalt) 0%,
            color-mix(in srgb, var(--color-basalt) 70%, transparent) 35%,
            transparent 70%
          ),
          linear-gradient(
            to right,
            color-mix(in srgb, var(--color-basalt) 70%, transparent) 0%,
            transparent 55%
          );
      }
    }
    /* A slow breath on the "open now" dot: the one live detail in the hero. */
    @media (prefers-reduced-motion: no-preference) {
      .live-dot {
        animation: live-breathe 2400ms var(--ease-calm) infinite alternate;
      }
    }
    @keyframes live-breathe {
      from {
        opacity: 0.35;
      }
      to {
        opacity: 1;
      }
    }
  `,
})
export class Hero {
  protected readonly site = site;
  protected readonly hero = site.hero;
  protected readonly showVideo = signal(false);
  protected readonly paused = signal(false);
  /** Prerendered as the static line; replaced by the live one in the browser. */
  protected readonly status = signal({ open: false, text: site.hoursShort });
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Video only in the browser, on wide screens, with motion allowed (CLAUDE.md §8).
      const ok =
        !!this.hero.video &&
        matchMedia('(min-width: 1100px)').matches &&
        !matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.showVideo.set(ok);

      // Live opening status, refreshed every minute.
      const tick = () => this.status.set(openStatus(new Date()));
      tick();
      const timer = setInterval(tick, 60_000);
      destroyRef.onDestroy(() => clearInterval(timer));
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
