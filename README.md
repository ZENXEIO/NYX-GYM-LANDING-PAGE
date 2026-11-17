# NYX — website

Marketing site for NYX, a private fitness club in Worli, Mumbai. Its job is to
book private tours and collect membership enquiries.
Angular + Tailwind CSS v4, prerendered to static HTML and served from a CDN.

The full spec (design system, architecture, motion, performance and
accessibility rules, decisions log) lives in [`CLAUDE.md`](CLAUDE.md). Read it
before changing anything.

## Run it

```bash
npm install
npm start            # dev server: http://localhost:4200
npm run build        # production build → dist/nyx/browser (static files)
```

| Command                | What it does                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| `npm start`            | Dev server on http://localhost:4200                                |
| `npm run build`        | Production build, prerendered; then adds CSP hashes to `_headers`  |
| `npm run lint`         | ESLint (angular-eslint)                                            |
| `npm run format`       | Prettier, with Tailwind class sorting                              |
| `npm run format:check` | Prettier check without writing                                     |
| `npm run images`       | Turns originals in `sources/assets/` into WebP in `public/images/` |
| `npm run verify:dist`  | Checks the build output is safe to deploy (run after a build)      |

There are no automated tests or CI pipeline (see `CLAUDE.md` §14). Before each
release, check by hand in a browser: 375, 768 and 1440px wide, keyboard only,
and with reduced motion turned on.

To preview the production build locally:

```bash
npx serve dist/nyx/browser
```

## What's on the homepage

1. **Hero:** full-screen photo, embossed NYX monogram, "A QUIETER / KIND OF /
   STRENGTH." and an info bar with live opening status. The nav capsule folds
   down to the Menu button once you scroll past the hero.
2. **The Club:** the story, an arch-framed portrait and the one stat, "150
   members. Never more."
3. **Facilities:** six rooms beside a pinned floor directory that rolls like a
   reel as you scroll (a gold rail on phones).
4. **Training:** personal training, small groups and the coaches.
5. **Membership:** Dusk, Nocturne and Eclipse as cream invitation cards.
   "Enquire" pre-fills the tour form.
6. **Testimonials:** member quotes and a partners and press row, in slow
   infinite sliders with a Pause button.
7. **Visit:** address, hours (today marked), click-to-load map and the tour form.
8. **Footer:** a necklace of lights that hangs from the top line and draws
   itself in, a pendant button that opens an invitation card, "Tap into a newer
   you.", then contact and legal links.

`/privacy` and `/terms` are placeholder pages. The other routes (`/club`,
`/facilities`, `/training`, `/membership`, `/visit`) are the next step.

## Change the copy

All text, tiers, facilities, coaches, hours, partners and contact details are
in `src/app/content/site.ts`. Edit there; no component changes needed.

## Before launch: replace the sample content

To make the site feel real, some content is **invented**, with no label on
the page. The header comment in `site.ts` lists it. Replace it all with real,
approved details:

- **Address** (Level 3, Sea Crest House) and the **facility floors** ("Level 3"
  etc. in the Facilities directory).
- **Coaches:** names, bios and the AI-generated portraits. Replace them together.
- **Member quotes:** must be real members' words, used with their consent.
  Publishing invented reviews breaks Indian consumer-protection rules.
- **Partners and press:** the six names (Saltwick Recovery, Monsoon Quarterly…)
  are fictional. Use only real relationships and real coverage, with
  permission. A fake "as featured in" misleads like a fake review.
- **Privacy and terms:** draft text. Have a lawyer review it.
- **Contact details** are dummies on purpose (`+91 00000 00000`,
  `nyx.example`). Set the real ones in `config.ts` (see Configuration).

## Photos

Every photo slot is filled with an AI-generated picture supplied on 17 Nov 2026. They are smaller than the recommended sizes, so they look slightly soft
on large or high-density screens. Replace them with real, larger photos when
available:

1. Put the original in `sources/assets/` (e.g. `sources/assets/pool.jpg`).
   `sources/` is never deployed.
2. Run `npm run images`. Each photo becomes
   `public/images/<name>-{640,1080,1600,2400}.webp`, and the script prints its
   shadow, highlight and mean colours.
3. In `site.ts`, set that image's `src` to `'/images/<name>'`, check the `alt`
   text, and set `focus` (e.g. `'60% 40%'`) if the subject must stay in frame
   on phones.

A new **hero** photo needs more care: the page colour is tuned to its shadows
and the headline sits on its quiet side. Follow the checklist in `CLAUDE.md`
§17. Recommended sizes are listed there too. An image with an empty `src` shows
a labelled placeholder with its size.

**Hero video (optional):** add `public/media/hero.mp4` and
`public/media/hero.webm`, then set `hero.video: '/media/hero'` in `site.ts`. It
plays only on wide screens when the visitor hasn't asked for reduced motion.

**Partner and press logos:** one-colour SVGs, used with permission. Put them in
`public/images/partners/` and set each item's `logo` (and real `name`) in
`site.testimonials.partners.items`. Until then each name shows as a text
wordmark.

## Configuration

All public settings are in `src/environments/config.ts`. Edit that file by hand;
there is no `.env` file and nothing is generated at build time.

| Setting            | What it does                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `siteUrl`          | Real domain: canonical URLs and social previews.                                           |
| `tourEndpoint`     | URL the form POSTs to. Empty = demo success in dev, phone/WhatsApp fallback in production. |
| `turnstileSiteKey` | Cloudflare Turnstile site key (anti-bot). Empty = off.                                     |
| `cfAnalyticsToken` | Cloudflare Web Analytics token (cookieless; includes Core Web Vitals). Empty = off.        |
| `contact`          | Phone, email and Instagram shown across the site.                                          |

Two things to change by hand alongside it:

- **Site URL and phone** are also written in `src/index.html` (JSON-LD),
  `public/robots.txt` and `public/sitemap.xml`.
- **Form endpoint:** add its origin to `connect-src` in `public/_headers`, or
  the browser blocks the request.

Everything in `config.ts` ends up in the browser bundle: never put secrets in it.
The request/response contract the form endpoint must follow is in `CLAUDE.md` §10.

## Motion and performance

All motion is CSS: no animation libraries. Most of it is tied to scrolling
(`animation-timeline: view()`). Browsers without scroll timelines, and visitors
who ask for reduced motion, see everything complete and still.

Two rules keep scrolling smooth (`CLAUDE.md` §4 and §8, ADR 22):

- **Animate only `transform` and `opacity` on scroll.** Clip-paths, colours,
  letter-spacing and inherited custom properties make the browser restyle or
  repaint on every frame. For reveals, scale a surface-coloured panel away
  instead. Let elements rest in their finished state; keyframes give only the
  start.
- **The motion gate** (`src/app/core/motion-gate.ts`) switches animations off
  in sections more than a screen away (`.is-far`), and back on before they can
  be seen. New homepage sections are gated automatically if they are a
  `<section id>` inside `<main>`.

Budgets: initial JS ≤ 130 KB gzip (the build warns at 400 kB raw), each
component's styles ≤ 4 kB. Lighthouse mobile ≥ 95 is still to be verified on
the deployed site.

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist/nyx/browser`

Nothing deploys automatically from GitHub. Use Cloudflare Pages' own Git
integration, or deploy by hand.

`public/_headers` sets caching and security headers. After each build,
`scripts/csp-hashes.mjs` adds hashes for Angular's inline scripts to the
Content-Security-Policy, so no `'unsafe-inline'` is needed for scripts.

Before deploying, run `npm run verify:dist`. It checks every route is
prerendered and the security headers are present, and it fails while
placeholder values (such as `nyx.example`) are still in the output.

## Fonts

Archivo and Bodoni Moda are self-hosted from `public/fonts/` (SIL Open Font
License 1.1, see `public/fonts/LICENSE.txt`).
