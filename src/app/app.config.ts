import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

/** Widths produced by scripts/optimize-images.mjs. */
export const IMAGE_WIDTHS = [640, 1080, 1600, 2400];

/** '/images/pool' + width → '/images/pool-1080.webp' (static files, no image CDN needed). */
export function nyxImageLoader({ src, width }: ImageLoaderConfig): string {
  const w = IMAGE_WIDTHS.find((x) => x >= (width ?? 1600)) ?? 2400;
  return `${src}-${w}.webp`;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withComponentInputBinding(),
    ),
    provideClientHydration(withIncrementalHydration()),
    provideHttpClient(withFetch()),
    { provide: IMAGE_LOADER, useValue: nyxImageLoader },
    { provide: IMAGE_CONFIG, useValue: { breakpoints: IMAGE_WIDTHS } },
  ],
};
