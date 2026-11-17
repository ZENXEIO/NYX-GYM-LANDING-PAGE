import { ChangeDetectionStrategy, Component } from '@angular/core';
import { site } from '../../../content/site';
import { Photo } from '../../../shared/photo';
import { Reveal } from '../../../shared/reveal';
import { FacilityDirectory } from './facility-directory';

/**
 * Facilities (dark): the six rooms beside a floor directory (CLAUDE.md §4, ADR 20).
 *
 * From 768px the directory (`nyx-facility-directory`, a rolling reel) stays
 * pinned on the left while the rooms scroll on the right. Phones: a gold rail
 * runs down the left gutter, its tip at the middle of the screen, and each
 * room's marker fills as the tip passes.
 *
 * Every room is a named scroll timeline (`--room-0` … `--room-5`), shared
 * section-wide with `timeline-scope` so the directory can follow it. CSS only.
 */
@Component({
  selector: 'nyx-facilities',
  imports: [Photo, Reveal, FacilityDirectory],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="facilities" class="rooms section-y bg-basalt" aria-labelledby="facilities-title">
      <div class="site-container site-grid">
        <div class="col-span-4 md:col-span-8 lg:col-span-7">
          <h2 id="facilities-title" class="text-h2 text-reveal" nyxReveal>
            {{ facilities.heading }}
          </h2>
          <p class="text-body-lg measure text-fg-muted mt-8">{{ facilities.intro }}</p>
        </div>
      </div>

      <div class="site-container site-grid mt-20 md:mt-28">
        <nyx-facility-directory
          class="hidden md:col-span-5 md:block"
          [items]="facilities.items"
          [label]="facilities.directoryLabel"
        />

        <div class="room-list col-span-4 md:col-span-7 md:col-start-6">
          <span class="rail md:hidden" aria-hidden="true"><span class="rail-fill"></span></span>
          @for (f of facilities.items; track f.id; let i = $index) {
            <article
              class="room"
              [id]="'facility-' + f.id"
              [style.--tl]="'--room-' + i"
              [attr.aria-labelledby]="'facility-' + f.id + '-title'"
            >
              <figure
                class="room-photo photo-reveal photo-hover lights-on relative aspect-[3/2] overflow-hidden"
                nyxReveal
              >
                <nyx-photo
                  class="absolute inset-0"
                  [image]="f.image"
                  sizes="(min-width: 768px) 60vw, 90vw"
                  [parallax]="true"
                />
              </figure>
              <div class="caption-follow relative mt-8 max-w-[34rem]" nyxReveal>
                <span class="rail-node md:hidden" aria-hidden="true"
                  ><span class="node-ring"></span
                ></span>
                <h3 [id]="'facility-' + f.id + '-title'" class="text-h3">{{ f.name }}</h3>
                <p class="text-label text-fg-muted mt-3 md:hidden">{{ f.where }}</p>
                <p class="text-fg-muted mt-4">
                  {{ f.lines[0] }}<br />
                  {{ f.lines[1] }}
                </p>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .rooms {
      /* Each room's scroll timeline, visible to the directory. Six rooms. */
      timeline-scope: --room-0, --room-1, --room-2, --room-3, --room-4, --room-5;
      /* The photos bleed past the container; clip (not hidden) keeps the
         directory sticky. */
      overflow-x: clip;
      --gap: 6rem;
      --bleed: 16px;
      /* Where a room "arrives": its top edge at the middle of the screen. */
      --mid: 50vh;
      /* A room's stay: from its arrival until the next room arrives. */
      --stay: cover var(--mid) cover calc(100% - var(--mid) + var(--gap));
    }
    @media (min-width: 768px) {
      .rooms {
        --gap: 9rem;
        --bleed: max(32px, calc((100vw - 1320px) / 2 + 32px));
      }
    }
    @media (min-width: 1100px) {
      .rooms {
        --bleed: max(40px, calc((100vw - 1320px) / 2 + 40px));
      }
    }
    .room-list {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--gap);
      padding-left: 40px;
    }
    @media (min-width: 768px) {
      .room-list {
        padding-left: 0;
      }
    }
    .room {
      view-timeline-name: var(--tl);
      scroll-margin-top: 8rem;
    }
    .room-photo {
      margin-right: calc(-1 * var(--bleed));
    }

    /* ── Phone rail ─────────────────────────────────────────── */
    .rail {
      position: absolute;
      left: 5px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--color-line);
    }
    .rail-fill {
      position: absolute;
      inset: 0;
      background: var(--color-bronze-light);
      transform-origin: top;
      transform: scaleY(0);
    }
    .rail-node {
      position: absolute;
      left: -40px;
      top: 0.55em;
      width: 11px;
      height: 11px;
      border: 1px solid var(--color-line);
      border-radius: 9999px;
      background: var(--color-basalt);
    }
    /* Its gold fill, faded in (opacity stays on the GPU). */
    .rail-node::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 9999px;
      background: var(--color-bronze-light);
      opacity: 0;
    }
    .node-ring {
      position: absolute;
      inset: -6px;
      border: 1px solid var(--color-bronze);
      border-radius: 9999px;
      opacity: 0;
      scale: 0.6;
    }

    /* One continuous line whose tip sits at the middle of the screen; each
       marker fills as the tip passes and keeps its outer ring while it is in
       the upper half. */
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        .room-list {
          view-timeline-name: --room-list;
        }
        .rail-fill {
          animation: rail-grow linear both;
          animation-timeline: --room-list;
          animation-range: cover var(--mid) cover calc(100% - var(--mid));
        }
        /* The fill is a pseudo-element: it follows the marker's own timeline. */
        .rail-node {
          view-timeline-name: --node;
        }
        .rail-node::after {
          animation: rail-reached linear both;
          animation-timeline: --node;
          animation-range: cover 47% cover 53%;
        }
        .node-ring {
          animation: rail-arrived linear both;
          animation-timeline: view();
          animation-range: cover 50% cover 100%;
        }
      }
    }
    @keyframes rail-grow {
      to {
        transform: scaleY(1);
      }
    }
    @keyframes rail-reached {
      to {
        opacity: 1;
      }
    }
    @keyframes rail-arrived {
      0% {
        opacity: 0;
        scale: 0.6;
      }
      15%,
      70% {
        opacity: 1;
        scale: 1;
      }
      100% {
        opacity: 0;
        scale: 1;
      }
    }
  `,
})
export class Facilities {
  protected readonly facilities = site.facilities;
}
