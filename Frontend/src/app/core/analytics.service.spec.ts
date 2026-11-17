import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';

const BEACON = 'script[src="https://static.cloudflareinsights.com/beacon.min.js"]';

describe('AnalyticsService', () => {
  let analytics: AnalyticsService;

  beforeEach(() => {
    analytics = TestBed.inject(AnalyticsService);
  });
  afterEach(() => document.querySelectorAll(BEACON).forEach((s) => s.remove()));

  it('loads the cookieless beacon in production when a token is set', () => {
    analytics.config = { production: true, token: 'abc123' };
    analytics.start();
    const s = document.querySelector<HTMLScriptElement>(BEACON)!;
    expect(s).toBeTruthy();
    expect(s.defer).toBe(true);
    expect(JSON.parse(s.getAttribute('data-cf-beacon')!)).toEqual({ token: 'abc123' });
  });

  it('loads it only once, however often start() is called', () => {
    analytics.config = { production: true, token: 'abc123' };
    analytics.start();
    analytics.start();
    expect(document.querySelectorAll(BEACON)).toHaveLength(1);
  });

  it('does nothing in development', () => {
    analytics.config = { production: false, token: 'abc123' };
    analytics.start();
    expect(document.querySelector(BEACON)).toBeNull();
  });

  it('does nothing without a token', () => {
    analytics.config = { production: true, token: '' };
    analytics.start();
    expect(document.querySelector(BEACON)).toBeNull();
  });
});
