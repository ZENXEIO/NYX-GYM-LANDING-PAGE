import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { site } from '../content/site';
import { environment } from '../../environments/environment';

export interface PageSeo {
  title: string;
  description: string;
  /** Path beginning with '/', e.g. '/' or '/membership'. */
  path: string;
  /** Keep the page out of search results (the 404 page). */
  noindex?: boolean;
}

/** Sets title, description, canonical and Open Graph/Twitter tags per route. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set({ title, description, path, noindex = false }: PageSeo): void {
    const url = environment.siteUrl + path;
    const image = `${environment.siteUrl}/og.png`;

    this.title.setTitle(title);

    const named: MetaDefinition[] = [
      { name: 'description', content: description },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ];
    const og: MetaDefinition[] = [
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:locale', content: 'en_GB' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
    ];
    named.forEach((tag) => this.meta.updateTag(tag, `name="${tag.name}"`));
    og.forEach((tag) => this.meta.updateTag(tag, `property="${tag.property}"`));
    if (noindex) this.meta.updateTag({ name: 'robots', content: 'noindex' });
    else this.meta.removeTag('name="robots"');

    let canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }
}
