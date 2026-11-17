import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteImage } from '../content/site';
import { Photo } from './photo';

export interface ArchAction {
  label: string;
  fragment: string;
  icon: 'down' | 'arrow';
}

/**
 * Deco arch image frame: semicircular top, with a circular notch at the
 * lower-right corner that holds a round button (CLAUDE.md §4, element 5).
 */
@Component({
  selector: 'nyx-arch-frame',
  imports: [Photo, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block' },
  template: `
    <nyx-photo
      class="arch-frame relative aspect-[4/5] w-full"
      [image]="image()"
      [sizes]="sizes()"
    />
    @if (action(); as a) {
      <a
        class="btn-round absolute right-0 bottom-0"
        routerLink="/"
        [fragment]="a.fragment"
        [attr.aria-label]="a.label"
        [title]="a.label"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          @if (a.icon === 'down') {
            <path d="M4 7l5 5 5-5" stroke="currentColor" stroke-width="1.25" />
          } @else {
            <path d="M5 13L13 5M6.5 5H13v6.5" stroke="currentColor" stroke-width="1.25" />
          }
        </svg>
      </a>
    }
  `,
})
export class ArchFrame {
  readonly image = input.required<SiteImage>();
  readonly sizes = input('(min-width: 768px) 30vw, 80vw');
  readonly action = input<ArchAction | null>(null);
}
