/**
 * Public site configuration, edited by hand. There is no .env file and no
 * build-time generation: what is written here is what ships.
 *
 * Everything here ends up in the browser bundle, so never put a secret in it
 * (no Turnstile SECRET key, no API keys with write access).
 *
 * When siteUrl or phone change, change the same values in:
 *   src/index.html      (JSON-LD: url, image, telephone)
 *   public/robots.txt   (Sitemap line)
 *   public/sitemap.xml  (every <loc>)
 * When tourEndpoint is set, add its origin to `connect-src` in public/_headers,
 * or the browser blocks the form request.
 */
export const config = {
  /** PLACEHOLDER. Canonical origin, no trailing slash. */
  siteUrl: 'https://nyx.example',
  /** Tour form endpoint (CLAUDE.md §10). Empty: demo success in dev, phone fallback in production. */
  tourEndpoint: '',
  /** Cloudflare Turnstile SITE key (public). Empty: the widget is not loaded. */
  turnstileSiteKey: '',
  /** Cloudflare Web Analytics token. Empty: no analytics. */
  cfAnalyticsToken: '',
  /** PLACEHOLDER contact details. `phone` is +91 followed by ten digits, no spaces. */
  contact: {
    phone: '+910000000000',
    phoneDisplay: '+91 00000 00000',
    email: 'hello@nyx.example',
    instagram: 'https://instagram.com/',
  },
};
