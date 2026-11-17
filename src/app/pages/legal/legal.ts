import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { legal } from '../../content/legal';
import { site } from '../../content/site';
import { SeoService } from '../../core/seo.service';

type LegalKind = keyof typeof legal;

/** /privacy and /terms. Text lives in content/legal.ts (sample text: review before launch). */
@Component({
  selector: 'nyx-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="section-y bg-basalt pt-40" aria-labelledby="legal-title">
      <div class="site-container site-grid gap-y-12">
        <header class="col-span-4 md:col-span-4">
          <h1 id="legal-title" class="text-h2">{{ page().title }}</h1>
          <p class="text-label text-plaster-muted mt-6">Last updated {{ page().updated }}</p>
        </header>

        <div class="col-span-4 md:col-span-7 md:col-start-6">
          <p class="text-body-lg measure text-plaster">{{ page().intro }}</p>
          @for (s of page().sections; track s.heading) {
            <section class="border-line mt-12 border-t pt-8">
              <h2 class="text-h3">{{ s.heading }}</h2>
              @for (p of s.paragraphs; track $index) {
                <p class="measure text-plaster-muted mt-4">{{ p }}</p>
              }
            </section>
          }
          <p class="text-plaster-muted mt-12">
            <a class="link-line text-plaster" [href]="'mailto:' + email">{{ email }}</a>
          </p>
        </div>
      </div>
    </article>
  `,
})
export class Legal {
  /** Bound from route `data.kind` (withComponentInputBinding). */
  readonly kind = input<LegalKind>('privacy');
  protected readonly page = computed(() => legal[this.kind()]);
  protected readonly email = site.contact.email;

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const p = this.page();
      seo.set({
        title: `${p.title} — ${site.name}`,
        description: p.description,
        path: `/${this.kind()}`,
      });
    });
  }
}
