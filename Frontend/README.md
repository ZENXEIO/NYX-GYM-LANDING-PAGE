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
npm test             # unit tests (Vitest)
npm run test:scripts # build-script tests (node --test)
npm run e2e          # Playwright + axe against a production build
npm run lint         # ESLint
```

The full test plan is in [`TESTING.md`](TESTING.md).

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

## Configuration (`.env`)

Copy `.env.example` to `.env` and fill it in. `scripts/set-env.mjs` turns it into
`src/environments/*.ts` before every start, build, test and lint, so **don't edit
those generated files**. On the host (Cloudflare Pages, GitHub Actions), set the
same names as environment variables instead; they override `.env`.

| Variable | What it does |
|---|---|
| `NYX_SITE_URL` | Real domain: canonical URLs, social previews, sitemap, robots.txt, JSON-LD. |
| `NYX_TOUR_ENDPOINT` | URL the form POSTs to. Empty = demo success in dev, phone/WhatsApp fallback in production. Its origin is added to the CSP `connect-src` automatically. |
| `NYX_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (anti-bot). Empty = off. |
| `NYX_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics token (cookieless; includes Core Web Vitals). Empty = off. |
| `NYX_PHONE`, `NYX_PHONE_DISPLAY`, `NYX_EMAIL`, `NYX_INSTAGRAM_URL` | Contact details shown across the site. |

Everything here ends up in the browser bundle: never put secrets in `.env`.
The request/response contract the form endpoint must follow is in `CLAUDE.md` §10.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist/nyx/browser`

`public/_headers` sets caching and security headers. After each build,
`scripts/csp-hashes.mjs` adds hashes for Angular's inline scripts to the
Content-Security-Policy, so no `'unsafe-inline'` is needed for scripts.

`%NYX_SITE_URL%` and `%NYX_PHONE%` in `src/index.html`, `public/robots.txt` and
`public/sitemap.xml` are filled from the configuration after each build.
Production builds refuse placeholder values (such as `nyx.example`) when
`CI=true` or `NYX_STRICT=true`, and `npm run verify:dist` checks the output.

## Fonts

Archivo and Bodoni Moda are self-hosted from `public/fonts/` (SIL Open Font
License 1.1, see `public/fonts/LICENSE.txt`).
