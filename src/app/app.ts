import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalyticsService } from './core/analytics.service';
import { Footer } from './layout/footer';
import { Header } from './layout/header';

@Component({
  selector: 'nyx-root',
  imports: [RouterOutlet, Header, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main" (click)="skipToMain($event)">Skip to content</a>
    <nyx-header />
    <main id="main" tabindex="-1" class="outline-none">
      <router-outlet />
    </main>
    <nyx-footer />
  `,
})
export class App {
  constructor() {
    const analytics = inject(AnalyticsService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      analytics.start();
      // Its own small chunk: not needed for first paint.
      import('./core/motion-gate').then(({ startMotionGate }) =>
        destroyRef.onDestroy(startMotionGate()),
      );
    });
  }

  /** Same-page skip that works on every route (no full navigation to '/#main'). */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView();
  }
}
