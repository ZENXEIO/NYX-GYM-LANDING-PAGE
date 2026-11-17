# NYX — website

Marketing site for NYX, a private fitness club in Worli, Mumbai.
Angular + Tailwind CSS v4, prerendered to static HTML and served from a CDN.

The full spec (design system, architecture, performance and accessibility rules)
lives in [`CLAUDE.md`](CLAUDE.md).

## Run it

```bash
npm install
npm start            # dev server: http://localhost:4200
npm run build        # production build → dist/nyx/browser (static files)
npm run lint         # ESLint
```

There are no automated tests or CI pipeline (see `CLAUDE.md` §14).

To preview the production build locally:

```bash
npx serve dist/nyx/browser
```

## Change the copy

All text, tiers, facilities, coaches, hours and contact details are in
`src/app/content/site.ts`. Edit there; no component changes needed.

Placeholder content is flagged in that file (`placeholder: true`, `PLACEHOLDER`
comments) and shown on the page with a bronze "Placeholder" label.

## Add real photos

1. Put the original files in `sources/assets/` (e.g. `sources/assets/pool.jpg`).
2. Run `npm run images`. Each photo becomes `public/images/<name>-{640,1080,1600,2400}.webp`,
   and the script prints its shadow, highlight and mean colours.
3. In `src/app/content/site.ts`, set that image's `src` to `'/images/<name>'`
   and check the `alt` text. Set `focus` (e.g. `'60% 40%'`) if the subject
   needs to stay in frame on mobile.

Recommended sizes are listed in `CLAUDE.md` §17 and printed on each placeholder.

Hero video (optional): add `public/media/hero.mp4` and `public/media/hero.webm`,
then set `hero.video: '/media/hero'` in `site.ts`. It plays only on wide screens
when the visitor hasn't asked for reduced motion.

## Configuration

All public settings are in `src/environments/config.ts`. Edit that file by hand;
there is no `.env` file and nothing is generated at build time.

| Setting | What it does |
|---|---|
| `siteUrl` | Real domain: canonical URLs and social previews. |
| `tourEndpoint` | URL the form POSTs to. Empty = demo success in dev, phone/WhatsApp fallback in production. |
| `turnstileSiteKey` | Cloudflare Turnstile site key (anti-bot). Empty = off. |
| `cfAnalyticsToken` | Cloudflare Web Analytics token (cookieless; includes Core Web Vitals). Empty = off. |
| `contact` | Phone, email and Instagram shown across the site. |

Two things to change by hand alongside it:

- **Site URL and phone** are also written in `src/index.html` (JSON-LD),
  `public/robots.txt` and `public/sitemap.xml`.
- **Form endpoint:** add its origin to `connect-src` in `public/_headers`, or
  the browser blocks the request.

Everything in `config.ts` ends up in the browser bundle: never put secrets in it.
The request/response contract the form endpoint must follow is in `CLAUDE.md` §10.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist/nyx/browser`

`public/_headers` sets caching and security headers. After each build,
`scripts/csp-hashes.mjs` adds hashes for Angular's inline scripts to the
Content-Security-Policy, so no `'unsafe-inline'` is needed for scripts.

Before deploying, run `npm run verify:dist`. It fails while placeholder values
(such as `nyx.example`) are still in the output.

## Fonts

Archivo and Bodoni Moda are self-hosted from `public/fonts/` (SIL Open Font
License 1.1, see `public/fonts/LICENSE.txt`).
