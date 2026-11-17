import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { site } from '../../../content/site';

/** Click-to-load map: no third-party request until the visitor asks for it. */
@Component({
  selector: 'nyx-map-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block aspect-[4/3] overflow-hidden border border-line bg-placeholder' },
  template: `
    @if (loaded()) {
      <iframe
        class="absolute inset-0 h-full w-full grayscale hue-rotate-180 invert-[0.9]"
        [src]="url()"
        [title]="'Map showing ' + query()"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    } @else {
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
        <p class="text-label text-fg-muted">{{ query() }}</p>
        <button type="button" class="btn" (click)="loaded.set(true)">{{ label() }}</button>
        <p class="text-fg-muted max-w-[32ch] text-sm">{{ note() }}</p>
      </div>
    }
  `,
})
export class MapEmbed {
  readonly query = input.required<string>();
  readonly label = input(site.visit.mapLabel);
  /** Tells the visitor what clicking will load (a third-party request). */
  readonly note = input(site.visit.mapNote);
  protected readonly loaded = signal(false);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly url = computed(() =>
    // Constant origin + encoded query only: safe to trust.
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${encodeURIComponent(this.query())}&output=embed`,
    ),
  );
}
