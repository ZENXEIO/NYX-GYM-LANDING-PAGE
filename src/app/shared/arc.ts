import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Quadratic curve control points for the arc (viewBox 0 0 120 40). */
const P0 = [2, 36] as const;
const P1 = [60, -10] as const;
const P2 = [118, 36] as const;

/** Points along the curve: the streetlights of the Queen's Necklace. */
const LIGHTS = [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86].map((t) => {
  const a = (1 - t) ** 2;
  const b = 2 * (1 - t) * t;
  const c = t ** 2;
  return {
    x: +(a * P0[0] + b * P1[0] + c * P2[0]).toFixed(2),
    y: +(a * P0[1] + b * P1[1] + c * P2[1] + 3).toFixed(2),
  };
});

/**
 * The signature bronze arc: Marine Drive's curve with its string of lights.
 * Used only in the hero and on membership invitations (CLAUDE.md §4).
 */
@Component({
  selector: 'nyx-arc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block text-accent' },
  template: `
    <svg
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden="true"
      class="block h-auto w-full"
      [class.arc-draw]="draw()"
    >
      <path
        d="M2 36 Q60 -10 118 36"
        pathLength="1"
        stroke="currentColor"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      @for (l of lights; track $index) {
        <circle [attr.cx]="l.x" [attr.cy]="l.y" r="0.9" fill="currentColor" />
      }
    </svg>
  `,
})
export class Arc {
  /** Draw the line once on page load (hero only). */
  readonly draw = input(false);
  protected readonly lights = LIGHTS;
}
