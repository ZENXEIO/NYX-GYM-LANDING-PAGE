import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Facility } from '../../../content/site';

/**
 * The Facilities floor directory, as a rolling reel (CLAUDE.md §4, ADR 20).
 *
 * Pinned beside the rooms from 768px. Each room is a named scroll timeline
 * (`--room-0` … `--room-5`, set and shared by `nyx-facilities`, which also
 * provides `--mid`, `--gap` and `--stay`). The reel is five slots tall: while
 * you scroll from one room's arrival to the next, the list slides up one slot,
 * the outgoing name shrinks and the incoming one grows, so the room you are in
 * always sits level with the gold tick. Its marker fills gold on arrival and
 * wears a second ring while you are there.
 *
 * CSS only. Without scroll timelines, or with reduced motion, it is a still
 * list. The links scroll to their room, with or without JavaScript.
 */
@Component({
  selector: 'nyx-facility-directory',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="reel" [attr.aria-label]="label()">
      <span class="focus-rule" aria-hidden="true"></span>
      <ol class="directory">
        @for (f of items(); track f.id; let i = $index; let last = $last) {
          <li
            class="dir-item"
            [style.--tl]="'--room-' + i"
            [style.--tl-in]="i > 0 ? '--room-' + (i - 1) : null"
            [style.--tl-out]="'--room-' + i"
          >
            @if (!last) {
              <span class="dir-seg" aria-hidden="true"><span class="seg-fill"></span></span>
            }
            <span class="node" aria-hidden="true"><span class="node-ring"></span></span>
            <a class="dir-link" [href]="'/#facility-' + f.id" (click)="go($event, f.id)">
              <span class="dir-name">{{ f.name }}</span>
              <span class="dir-where text-label">{{ f.where }}</span>
            </a>
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    /* ── Still directory (the default) ──────────────────────── */
    .reel {
      position: sticky;
      top: 8rem;
    }
    .focus-rule {
      display: none;
    }
    .dir-item {
      position: relative;
      padding: 0 0 2.25rem 2.25rem;
    }
    .dir-item:last-child {
      padding-bottom: 0;
    }
    .node {
      position: absolute;
      left: 0;
      top: 0.45em;
      width: 11px;
      height: 11px;
      border: 1px solid var(--color-line);
      border-radius: 9999px;
      background: var(--color-basalt);
    }
    /* Its gold fill, faded in (opacity stays on the GPU). */
    .node::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 9999px;
      background: var(--color-bronze-light);
      opacity: 0;
    }
    /* "Here now": a second, finer ring, like the invitations' double frame. */
    .node-ring {
      position: absolute;
      inset: -6px;
      border: 1px solid var(--color-bronze);
      border-radius: 9999px;
      opacity: 0;
      scale: 0.6;
    }
    /* The line from this marker to the next. */
    .dir-seg {
      position: absolute;
      left: 5px;
      top: calc(0.45em + 11px);
      bottom: -0.45em;
      width: 1px;
      background: var(--color-line);
    }
    .seg-fill {
      position: absolute;
      inset: 0;
      background: var(--color-bronze-light);
      transform-origin: top;
      transform: scaleY(0);
    }
    .dir-link {
      display: block;
      min-height: 44px;
    }
    .dir-name {
      display: block;
      font-size: 1.375rem;
      font-weight: 500;
      font-stretch: 118%;
      line-height: 1.15;
      color: var(--color-plaster-muted);
      transition: color 900ms var(--ease-calm);
    }
    .dir-link:hover .dir-name,
    .dir-link:focus-visible .dir-name {
      color: var(--color-plaster);
    }
    .dir-where {
      display: block;
      margin-top: 6px;
      color: var(--color-plaster-muted);
    }

    /* ── Scroll-linked ──────────────────────────────────────── */
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        /* Only transform and opacity animate here, so the GPU does the work
           and scrolling stays light. A room arrives when its top reaches the
           middle of the screen and stays "here" until the next room arrives. */
        .node::after {
          animation: room-lit linear both;
          animation-timeline: var(--tl);
          animation-range: cover calc(var(--mid) - 40px) cover calc(var(--mid) + 40px);
        }
        .node-ring {
          animation: room-here linear both;
          animation-timeline: var(--tl);
          animation-range: var(--stay);
        }
        .seg-fill {
          animation: room-line linear both;
          animation-timeline: var(--tl);
          animation-range: var(--stay);
        }

        /* The rolling reel. Room k's stay drives the k-th slide step, shrinks
           name k and grows name k+1, in lockstep. */
        :host {
          /* Height-aware so the pinned window (5 slots + 8rem offset) fits short
             screens too, e.g. phones in landscape and iPad split view. */
          --slot: clamp(2.75rem, min(max(4.5rem, 7vw), (100svh - 10rem) / 5), 7rem);
        }
        .reel {
          height: calc(5 * var(--slot));
          overflow: clip;
        }
        /* Never hide a focused link. */
        .reel:focus-within {
          overflow: visible;
        }
        /* A short gold tick in the margin, level with the focus slot; outside
           the names' path, so nothing ever strikes through it. */
        .focus-rule {
          display: block;
          position: absolute;
          left: -1.75rem;
          width: 1rem;
          top: calc(2.5 * var(--slot));
          height: 1px;
          background: var(--color-bronze);
        }
        .directory {
          /* One slot per room, added up: five copies of the same step. */
          animation:
            reel-step linear both,
            reel-step linear both,
            reel-step linear both,
            reel-step linear both,
            reel-step linear both;
          animation-timeline: --room-0, --room-1, --room-2, --room-3, --room-4;
          /* A shorter list repeats: every step uses the same range. */
          animation-range: var(--stay);
          animation-composition: add;
          translate: 0 calc(2 * var(--slot));
        }
        .dir-item {
          display: flex;
          align-items: center;
          height: var(--slot);
          padding: 0 0 0 2.75rem;
        }
        .node {
          top: 50%;
          translate: 0 -50%;
        }
        .dir-seg {
          top: calc(50% + 6px);
          bottom: auto;
          height: calc(var(--slot) - 12px);
        }
        .dir-link {
          position: relative;
          display: flex;
          align-items: center;
        }
        /* Away from the line: small and dim. Each name grows during the
           previous room's stay (fill both) and shrinks during its own (fill
           forwards only, so it never overrides the growing before it starts). */
        .dir-name {
          font-size: clamp(1.375rem, 3vw, 2.5rem);
          font-weight: 600;
          line-height: 1.1;
          white-space: nowrap;
          color: var(--color-plaster);
          transform-origin: left center;
          /* 55% plaster on basalt is about 5.2:1, so names away from the line
             still pass WCAG AA contrast (was 28%, about 2:1). */
          scale: 0.65;
          opacity: 0.55;
          animation:
            name-grow linear both,
            name-shrink linear forwards;
          animation-timeline: var(--tl-in), var(--tl-out);
          animation-range: var(--stay);
        }
        .dir-where {
          position: absolute;
          left: 0;
          top: calc(100% - 2px);
          white-space: nowrap;
          color: var(--color-bronze);
          opacity: 0;
          animation:
            fade-in linear both,
            fade-out linear forwards;
          animation-timeline: var(--tl-in), var(--tl-out);
          animation-range: var(--stay);
        }
        /* The strength floor starts on the line. */
        .dir-item:first-child .dir-name,
        .dir-item:first-child .dir-where {
          scale: 1;
          opacity: 1;
          animation-name: name-shrink;
          animation-fill-mode: forwards;
          animation-timeline: var(--tl-out);
        }
        .dir-item:first-child .dir-where {
          animation-name: fade-out;
        }
        /* The lounge stays on the line at the end. */
        .dir-item:last-child .dir-name {
          animation: name-grow linear both;
          animation-timeline: var(--tl-in);
          animation-range: var(--stay);
        }
        .dir-item:last-child .dir-where {
          animation: fade-in linear both;
          animation-timeline: var(--tl-in);
          animation-range: var(--stay);
        }
        .dir-link:focus .dir-name {
          opacity: 1 !important;
        }
      }
    }

    @keyframes reel-step {
      to {
        translate: 0 calc(-1 * var(--slot));
      }
    }
    @keyframes name-grow {
      from {
        scale: 0.65;
        opacity: 0.55;
      }
      to {
        scale: 1;
        opacity: 1;
      }
    }
    @keyframes name-shrink {
      from {
        scale: 1;
        opacity: 1;
      }
      to {
        scale: 0.65;
        opacity: 0.55;
      }
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    @keyframes room-lit {
      to {
        opacity: 1;
      }
    }
    @keyframes room-line {
      to {
        transform: scaleY(1);
      }
    }
    /* On for the whole stay, with a short fade at each end. */
    @keyframes room-here {
      0% {
        opacity: 0;
        scale: 0.6;
      }
      10%,
      90% {
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
export class FacilityDirectory {
  readonly items = input.required<readonly Facility[]>();
  /** Accessible name of the nav. */
  readonly label = input.required<string>();

  /**
   * Scroll to a room (smoothly, unless reduced motion is on: html has
   * scroll-behavior: smooth only then). Modified clicks keep the real link.
   */
  protected go(event: MouseEvent, id: string): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const target = document.getElementById('facility-' + id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ block: 'start' });
  }
}
