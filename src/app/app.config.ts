import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';

/** Widths produced by scripts/optimize-images.mjs. */
export const IMAGE_WIDTHS = [640, 1080, 1600, 2400];

/** '/images/pool' + width → '/images/pool-1080.webp' (static files, no image CDN needed). */
export function nyxImageLoader({ src, width }: ImageLoaderConfig): string {
  const w = IMAGE_WIDTHS.find((x) => x >= (width ?? 1600)) ?? 2400;
  return `${src}-${w}.webp`;
}

/** The deepest active route: the page being shown. */
function leaf(s: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return s.firstChild ? leaf(s.firstChild) : s;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withComponentInputBinding(),
      // Crossfade between pages (styles.css). Same-page jumps (/#visit from the
      // homepage) skip it, so in-page scrolling is never replaced by a fade.
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (leaf(from).routeConfig === leaf(to).routeConfig) transition.skipTransition();
        },
      }),
    ),
    provideClientHydration(withIncrementalHydration()),
    provideHttpClient(withFetch()),
    { provide: IMAGE_LOADER, useValue: nyxImageLoader },
    { provide: IMAGE_CONFIG, useValue: { breakpoints: IMAGE_WIDTHS } },
  ],
};
