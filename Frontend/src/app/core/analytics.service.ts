import { DOCUMENT, Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Cookieless Cloudflare Web Analytics. The beacon also reports Core Web Vitals
 * (LCP, INP, CLS), so no extra library is needed. Production + token only.
 * Call from browser-only code (afterNextRender).
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly doc = inject(DOCUMENT);
  private started = false;
  /** Overridable in tests. */
  config = { production: environment.production, token: environment.cfAnalyticsToken };

  start(): void {
    const { production, token } = this.config;
    if (this.started || !production || !token) return;
    this.started = true;
    const s = this.doc.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token }));
    this.doc.body.appendChild(s);
  }
}
