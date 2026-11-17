import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SiteImage } from '../content/site';

/**
 * Optimised photo, or a labelled placeholder when `image.src` is empty.
 * The caller sets position and size: either `relative` + an aspect-ratio
 * class, or `absolute inset-0` inside a sized parent. (Position is not set
 * here, so it can't override the caller's.)
 */
@Component({
  selector: 'nyx-photo',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-hidden bg-placeholder' },
  template: `
    @if (image().src; as src) {
      <img
        [ngSrc]="src"
        [alt]="image().alt"
        fill
        [sizes]="sizes()"
        [priority]="priority()"
        [style.object-position]="image().focus ?? '50% 50%'"
        class="object-cover"
        [class.parallax]="parallax()"
      />
    } @else {
      <div
        role="img"
        [attr.aria-label]="image().alt + ' (placeholder image)'"
        class="border-hairline absolute inset-0 flex rounded-[inherit] border p-5 md:p-6"
        [class]="
          corner()
            ? 'items-start justify-end pt-24 text-right md:pt-32'
            : 'items-center justify-center text-center'
        "
      >
        <span class="text-label text-fg-muted">
          <span class="text-accent">Placeholder photo</span><br />
          {{ image().label }}<br />
          <span>{{ image().spec }}</span>
        </span>
      </div>
    }
  `,
})
export class Photo {
  readonly image = input.required<SiteImage>();
  /** Responsive `sizes` attribute, e.g. '(min-width: 768px) 58vw, 100vw'. */
  readonly sizes = input('100vw');
  readonly priority = input(false);
  readonly parallax = input(false);
  /** Put the placeholder label in the top-right corner instead of the centre. */
  readonly corner = input(false);
}
