# NYX

NYX is a premium private fitness club in Worli, Mumbai. The site exists to book private tours and collect membership enquiries for a calm, high-end club experience.

This repository contains the Angular marketing site for NYX. It is a static, prerendered front end built with Angular and Tailwind CSS, designed to feel like a quiet luxury members' club rather than a conventional gym website.

The full implementation and product spec live in [CLAUDE.md](CLAUDE.md). Read that first before making design or content changes.

## Stack

- Angular 22
- Tailwind CSS v4
- Static prerendering (no server runtime)
- Cloudflare Pages-friendly deployment
- Self-hosted fonts
- CSS-only motion and scroll-driven animation

## Quick start

```bash
npm install
npm start
```

Open http://localhost:4200

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Angular dev server on http://localhost:4200 |
| `npm run build` | Production build; output is `dist/nyx/browser` |
| `npm run lint` | Run Angular ESLint checks |
| `npm run format` | Format source files with Prettier and Tailwind sorting |
| `npm run format:check` | Check formatting without writing files |
| `npm run images` | Generate optimised WebP images for originals in `sources/assets/` |
| `npm run verify:dist` | Validate the production output before deployment |

## Project structure

```text
.
├─ public/                  # static files, robots, sitemap, headers, fonts, images
├─ scripts/                 # build-time and verification helpers
├─ sources/                 # original designer assets and inspiration (not deployed)
├─ src/
│  ├─ app/                 # routes, layout, content, sections, UI components
│  ├─ environments/        # public config and static environment values
│  ├─ index.html           # font preload, SEO metadata, schema markup
│  └─ styles.css           # design tokens and shared CSS
├─ CLAUDE.md               # design, motion, accessibility, SEO and delivery spec
├─ README.md                # project overview and runbook
├─ package.json             # scripts and dependencies
└─ ...
```

## Site overview

The homepage contains:

1. Hero with full-screen photography, monogram and quiet luxury headline
2. The Club story and one stat
3. Facilities with a pinned directory and room reel
4. Training and coaching content
5. Membership invitation cards for Dusk, Nocturne and Eclipse
6. Testimonials and partner/press slider
7. Visit section with hours, map and tour form
8. Closing footer with the necklace-style invitation moment

Other routes include:

- `/club`
- `/facilities`
- `/training`
- `/membership`
- `/visit`
- `/privacy`
- `/terms`
- `/404`

## Content and copy management

All copy and content structure live in the app content files under `src/app/content/`.

- `site.ts` holds page copy, facility entries, membership tiers, coaches, hours, address and image references.
- `legal.ts` holds privacy and terms copy, loaded only for the legal routes.

Do not hard-code copy into templates. Keep all marketing and legal text in the content layer.

## Before launch

The current site intentionally contains placeholder sample content and dummy contact details until the final approved brand and legal copy is supplied.

Replace before launch:

- address and facility floor names
- coach names, bios and images
- member quotes and ratings
- partner and press names and logos
- privacy and terms text with legal review
- contact details and real URLs
- any final asset that should be production approved

The placeholder details are called out in the source comment header and in the project spec.

## Configuration

Public settings are stored in `src/environments/config.ts` and intentionally committed to the repository. There is no `.env` file or generated config step.

Update these values when the site goes live:

- `siteUrl`
- `tourEndpoint`
- `turnstileSiteKey`
- `cfAnalyticsToken`
- `contact`

Also update the matching static references in:

- `src/index.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `public/_headers` when the form endpoint origin is added to `connect-src`

## Assets and photography

Originals live in `sources/assets/` and are never deployed. Run:

```bash
npm run images
```

This creates optimised WebP files in `public/images/` for the site, while preserving the original source in `sources/`.

For a hero image or any major visual change, follow the asset checklist in [CLAUDE.md](CLAUDE.md), including tone analysis, focal point, contrast checks and the local scrim decision where relevant.

## Deployment

The site is designed to deploy as a static bundle on Cloudflare Pages or equivalent static hosting.

Build and verify before deploy:

```bash
npm run build
npm run verify:dist
```

The production output is generated in `dist/nyx/browser`.

## Accessibility and quality checks

There are no automated browser test suites in this project. Before release, validate manually:

- desktop, tablet and mobile sizes
- keyboard-only navigation
- reduced-motion mode
- form validation and fallback path
- accessible contrast and focus states
- build and dist verification

## Notes

- The project intentionally avoids animation libraries and heavy client-side JS.
- Motion is CSS-only and designed to remain smooth on lower-end mobile devices.
- The legal and marketing text must be approved before launch; some supplied content is intentionally sample-only.

For the complete design, motion, content and deployment rules, read [CLAUDE.md](CLAUDE.md).
