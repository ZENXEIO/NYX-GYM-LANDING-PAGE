import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { site } from '../../content/site';
import { SeoService } from '../../core/seo.service';

type LegalKind = keyof typeof site.legal;

/** Placeholder legal pages until the client supplies approved text (Step 3). */
@Component({
  selector: 'nyx-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section-y bg-basalt pt-40">
      <div class="site-container">
        <h1 class="text-h2">{{ page().title }}</h1>
        <p class="text-label text-accent mt-8">Placeholder</p>
        <p class="text-body-lg measure text-fg-muted mt-4">
          The approved {{ page().title.toLowerCase() }} text will appear here.
        </p>
      </div>
    </section>
  `,
})
export class Legal {
  /** Bound from route `data.kind` (withComponentInputBinding). */
  readonly kind = input<LegalKind>('privacy');
  protected readonly page = computed(() => site.legal[this.kind()]);

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
