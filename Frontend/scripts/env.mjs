// Shared loader for public build-time config (CLAUDE.md §7).
// Reads `.env` (if present). Real environment variables win, so CI / Cloudflare
// Pages can set values in their dashboard without a `.env` file.
import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

const str = (key, fallback = '') => (process.env[key] ?? fallback).trim();

export function loadConfig() {
  const phone = str('NYX_PHONE', '+910000000000').replace(/[\s-]/g, '');
  return {
    siteUrl: str('NYX_SITE_URL', 'https://nyx.example').replace(/\/+$/, ''),
    tourEndpoint: str('NYX_TOUR_ENDPOINT'),
    turnstileSiteKey: str('NYX_TURNSTILE_SITE_KEY'),
    cfAnalyticsToken: str('NYX_CF_ANALYTICS_TOKEN'),
    contact: {
      phone,
      phoneDisplay: str('NYX_PHONE_DISPLAY', '+91 00000 00000'),
      email: str('NYX_EMAIL', 'hello@nyx.example'),
      instagram: str('NYX_INSTAGRAM_URL', 'https://instagram.com/'),
    },
  };
}

/** Problems that must not reach production. Returns a list of messages. */
export function productionProblems(c) {
  const problems = [];
  const isHttps = (u) => {
    try {
      return new URL(u).protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!isHttps(c.siteUrl)) problems.push(`NYX_SITE_URL must be an https URL (got "${c.siteUrl}").`);
  if (/\.example$|localhost/.test(c.siteUrl)) problems.push('NYX_SITE_URL is still a placeholder domain.');
  if (!c.tourEndpoint) problems.push('NYX_TOUR_ENDPOINT is empty: tour requests would not be delivered.');
  else if (!isHttps(c.tourEndpoint)) problems.push('NYX_TOUR_ENDPOINT must be an https URL.');
  if (!c.turnstileSiteKey) problems.push('NYX_TURNSTILE_SITE_KEY is empty: the form has no bot protection.');
  if (!/^\+91[6-9]\d{9}$/.test(c.contact.phone)) problems.push('NYX_PHONE is not a real Indian mobile in +91XXXXXXXXXX form.');
  if (/example/.test(c.contact.email)) problems.push('NYX_EMAIL is still a placeholder address.');
  if (/^https:\/\/(www\.)?instagram\.com\/?$/.test(c.contact.instagram)) problems.push('NYX_INSTAGRAM_URL points to instagram.com, not the club profile.');
  return problems;
}
