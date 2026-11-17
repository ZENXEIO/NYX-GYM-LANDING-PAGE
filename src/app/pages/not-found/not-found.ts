import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { site } from '../../content/site';
import { SeoService } from '../../core/seo.service';

/** Unknown addresses. Prerendered at /404 and copied to 404.html after the build. */
@Component({
  selector: 'nyx-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section-y bg-basalt flex min-h-svh items-end pt-40" aria-labelledby="nf-title">
      <div class="site-container site-grid gap-y-10">
        <h1 id="nf-title" class="text-h2 col-span-4 md:col-span-8">{{ copy.title }}</h1>
        <div class="col-span-4 md:col-span-6">
          <p class="text-body-lg measure text-plaster-muted">{{ copy.text }}</p>
          <div class="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <a class="btn" routerLink="/" fragment="visit">{{ copy.cta }}</a>
            <a class="link-line link-tap text-plaster self-start" routerLink="/">{{ copy.home }}</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class NotFound {
  protected readonly copy = site.notFound;

  constructor() {
    inject(SeoService).set({
      title: this.copy.seoTitle,
      description: this.copy.description,
      path: '/404',
      noindex: true,
    });
  }
}
