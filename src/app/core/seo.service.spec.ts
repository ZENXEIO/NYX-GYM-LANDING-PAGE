import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { environment } from '../../environments/environment';

describe('SeoService', () => {
  it('sets title, description, canonical and Open Graph tags', () => {
    const seo = TestBed.inject(SeoService);
    const doc = TestBed.inject(DOCUMENT);

    seo.set({
      title: 'Membership — NYX',
      description: 'Three ways to belong.',
      path: '/membership',
    });

    const url = `${environment.siteUrl}/membership`;
    expect(doc.title).toBe('Membership — NYX');
    expect(doc.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Three ways to belong.',
    );
    expect(doc.head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(url);
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(url);

    // Calling again updates in place rather than duplicating tags.
    seo.set({ title: 'Home', description: 'x', path: '/' });
    expect(doc.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(doc.head.querySelectorAll('meta[name="description"]').length).toBe(1);
  });
});
