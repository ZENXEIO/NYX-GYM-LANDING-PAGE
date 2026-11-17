# CLAUDE.md — NYX website

Standing spec for the NYX marketing site. Read this before any change. If a decision here changes, update this file in the same change.

---

## 1. Project

- **NYX** is a premium private fitness club in Mumbai. The site's job is to **book private tours** and **collect membership enquiries**.
- **Brand feel:** a five-star hotel or private members' club, not a gym. Calm, confident, exclusive. No neon, no stock "AI" gradients, no clutter.
- **Language:** English (UK spelling).
- **Process:**
  1. Design system and sitemap ✅ approved. Reference vibe adapted ✅ (see section 4).
  2. Homepage ✅ built (16 Nov 2026), **awaiting user review**.
  3. Remaining pages in the same style. `/privacy` and `/terms` exist only as placeholder pages.

  Never start the next step without the user's approval.
- **Placeholders:** every address, phone number, coach, testimonial, photo and video is a **clearly labelled placeholder** until the user supplies the real one (section 17).
- **Location:** the Angular app lives directly in the repo root (`Frontend/`). Do **not** nest it in a subfolder. All paths below are relative to the root.
- **`sources/`** (at the repo root) holds the user's inspiration screenshots and original assets. It is **never deployed** and never served directly.

## 2. Commands (run in the repo root)

| Command | Purpose |
|---|---|
| `npm start` | Dev server on http://localhost:4200 |
| `npm run build` | Production build; prerendered output in `dist/nyx/browser`. `prebuild` generates `src/environments/` from `.env` and checks for placeholders; `postbuild` runs `scripts/inject-dist.mjs` then `scripts/csp-hashes.mjs` |
| `npm run env` | Regenerate `src/environments/*.ts` from `.env` (also runs before start, test and lint) |
| `npm test` | Unit tests, single run (Vitest via `ng test`). `npm run test:watch` to watch; `npm run test:coverage` enforces the thresholds in `angular.json` |
| `npm run test:scripts` | Node tests for the build scripts (`scripts/test/`) |
| `npm run lint` | angular-eslint |
| `npm run format` | Prettier (with Tailwind class sorting) |
| `npm run images` | `scripts/optimize-images.mjs`: turns `sources/assets/` originals into WebP in `public/images/` and prints tone data |
| `npm run e2e` | Builds `dist/e2e` (`scripts/e2e-build.mjs`, fake form endpoint) then runs Playwright + axe on installed Chrome at 375/768/1440. `e2e:only` skips the build; `e2e:visual` runs screenshot tests (section 14) |
| `npm run lhci` | Lighthouse CI on `dist/nyx/browser` with the section 8 budgets (`lighthouserc.json`) |

## 3. Tech stack & architecture

- **Angular (latest stable)**: standalone components, signals, zoneless change detection, new control flow (`@if` / `@for` / `@defer`), `OnPush` everywhere.
- **Tailwind CSS v4** via `@tailwindcss/postcss` (`.postcssrc.json`). Design tokens are defined **once** in `@theme` in `src/styles.css`.
- **Rendering:** `"outputMode": "static"`. Every route is prerendered to HTML at build time, then hydrated on the client (incremental hydration for `@defer` blocks). **No server runtime.**
- **Hosting:** Cloudflare Pages (global CDN with a Mumbai edge location). `public/_headers` sets caching and security headers. Netlify, Vercel and Firebase Hosting are acceptable alternatives with equivalent config.
- **Not allowed:** UI component libraries, `@angular/animations`, jQuery, GSAP or other motion libraries. **Motion is CSS only.**

```
(repo root = Frontend/)
  sources/                      inspiration + original assets (never deployed)
  src/
    styles.css                  @theme tokens, base layer, @layer components, motion keyframes, reduced-motion
    index.html                  @font-face + font preloads, favicon, HealthClub JSON-LD
    environments/               environment.ts / environment.development.ts (public config only)
    app/
      app.config.ts             provideRouter(withInMemoryScrolling, withComponentInputBinding),
                                provideClientHydration(withIncrementalHydration), provideHttpClient(withFetch),
                                IMAGE_LOADER (static '/images/<name>-<width>.webp'). Zoneless is the Angular 22 default.
      app.routes.ts             lazy loadComponent per page + route titles
      app.ts                    shell: skip link, <nyx-header>, <main id="main">, <nyx-footer>
      content/site.ts           ALL copy, tiers, facilities, coaches, hours, address, image paths (typed)
      core/
        seo.service.ts          title, description, canonical, OG/Twitter per route
        analytics.service.ts    web-vitals + error reporting (browser only, prod only)
        tour-api.service.ts     form submission: timeout, retry, idempotency, error mapping
        enquiry.state.ts        signal: tier chosen via "Enquire", pre-fills the form
      layout/                   header (nav capsule + menu <dialog>), footer
      shared/                   photo, arch-frame, arc, reveal (directive)
      pages/
        home/home.ts            sections below the fold use @defer (hydrate on viewport)
        home/sections/          hero (+ monogram, info bar), club, facilities, training, membership,
                                testimonials, visit, tour-form (+ validators), map-embed
        legal/legal.ts          placeholder /privacy and /terms
        club/ facilities/ training/ membership/ visit/     ← Step 3
  public/                       _headers, robots.txt, sitemap.xml, favicon.svg, og.png, fonts/, images/, media/
  scripts/optimize-images.mjs   sharp pipeline (section 17)
  scripts/csp-hashes.mjs        post-build: hashes inline scripts into the CSP in dist/.../_headers
  scripts/dist.mjs              shared post-build helpers: distDir() (honours NYX_DIST), walk()
  e2e/                          Playwright specs (fixtures.ts mocks the form endpoint, blocks third parties)
  load/                         k6 script for the form endpoint (run against staging)
  TESTING.md                    test plan: layers, cases, gaps
```

## 4. Design system (source of truth)

**Concept: "Mumbai after dark", confident.** Nyx is the goddess of night. The palette is Deccan basalt and lime plaster. The one signature motif is a fine bronze arc, the curve of Marine Drive's *Queen's Necklace*. The same curve shapes the Deco arch image frames.

### Reference adaptation

The user's screenshots in `sources/` are **inspiration, not templates**. They set the vibe, which we adapt:
- confident large type
- dark sculptural imagery with metallic light
- framed "floating" UI chrome
- one strong image shape

**Do not copy:**
- the snake, blackletter letterforms or terracotta
- "+120k"-style stat rows
- bracketed monospace taglines ("[ A. B. C. ]")
- pill-button nav or the globe icon
- either reference's layout or copy

### Colour

| Token | Value | Use |
|---|---|---|
| `basalt` | `#161A1D` | Page base on dark sections. **Retune to the supplied hero's deepest shadow** (section 17) so image edges melt into the page |
| `monsoon` | `#1F2528` | Alternate dark surface (Training), form fields |
| `plaster` | `#EDE6DA` | Text on dark sections, and the **background of light sections** |
| `plaster-muted` | `#A9A398` | Secondary text on dark (≈7:1 on basalt) |
| `ink` | `#161A1D` | Text on plaster sections |
| `ink-muted` | `#4E4A43` | Secondary text on plaster (≈7:1). **Never** use `plaster-muted` on plaster |
| `card` | `#F6F1E7` | Invitation card stock on plaster sections |
| `bronze` | `#B08D57` | The **only** accent on dark: arc, focus ring, button outline, active link (≈5.7:1 on basalt) |
| `bronze-light` | `#C9A774` | Bronze hover state on dark only |
| `bronze-deep` | `#7A5A2E` | Bronze on plaster sections (≈5.1:1). **Never** use `bronze` on plaster (2.7:1 fails) |
| `line` | `rgba(237,230,218,0.14)` | Hairlines on dark |
| `line-dark` | `rgba(22,26,29,0.16)` | Hairlines on plaster |

Rules:
- The accent covers under 2% of any screen.
- No shadows.
- No gradients. The only exceptions are a flat basalt scrim over photos, applied locally and only where text contrast needs it, and the edge fade that melts the hero into basalt.

**Section rhythm (dark with light pauses):**

| Section | Background |
|---|---|
| Hero | dark |
| **The Club** | **plaster** |
| Facilities | dark |
| Training | monsoon |
| **Membership** | **plaster** (invitations read like cream card stock) |
| Testimonials | dark |
| Visit | dark |
| Footer | basalt |

### Typography (hybrid, two families)

- **Archivo** (Google, variable `wght` + `wdth`) does all the sans work.
  - **Display:** Archivo Expanded (`wdth` ≈ 118), weight 600.
  - **Body and UI:** Archivo at `wdth` 100, weights 400 and 500.
- **Bodoni Moda** (400, roman) is used **only** for editorial moments: membership tier names, member quotes and the single club stat.
- Both are **self-hosted** from `public/fonts/` (Latin subset woff2, SIL OFL 1.1). `@font-face` is inline in `index.html` with `font-display: swap`, and both files are preloaded. There is no third-party font request.
- Surface-aware utilities: `text-fg`, `text-fg-muted`, `text-accent`, `border-hairline` and `bg-placeholder` switch automatically inside `[data-surface='light']`.

| Role | Face | Mobile → Desktop | Leading / tracking |
|---|---|---|---|
| Hero (stacked, **uppercase**) | Archivo Expanded 600 | 48 → 128px | 0.95 / −0.01em |
| H2 | Archivo Expanded 600 | 34 → 72px | 1.02 / −0.005em |
| H3 | Archivo Expanded 500 | 22 → 30px | 1.15 |
| Editorial (tiers, quotes, stat) | Bodoni Moda 400 | 32 → 64px | 1.1 |
| Body large | Archivo 400 | 19 → 21px | 1.55 |
| Body | Archivo 400 | 17px | 1.6, max 62ch |
| Label | Archivo 500 | 12px | uppercase, +0.2em |

- **Uppercase:** the hero headline is the **only** uppercase heading. Spend the boldness there. Every other heading is sentence case: big and calm, not shouting.
- **Labels:** only where they carry information (nav, facility names, form labels, hours, the info bar). Never as decoration above headings.
- **Headlines:** set in full. Never accent a single word with italics or colour.
- **Alignment:** left-aligned by default. Membership invitations are centred. Hero text placement follows the hero image's quiet side (section 17).

### Layout & spacing

- 8px base unit. Steps: 4, 8, 16, 24, 40, 64, 96, 160, 240.
- Section padding: `clamp(96px, 14vw, 200px)` vertical.
- **Grid:**
  - Desktop: 12 columns, max width 1320px, 24px gutter.
  - Mobile: 4 columns, **16px side gutters**.
  - Breakpoints are mobile-first: 768px and 1100px.
- Use asymmetric splits (text in cols 2–6, image in cols 7–12, alternating). Never use identical card grids.
- Hairline 1px borders (`line` / `line-dark`).
- Radius:
  - Photos: 0, except the arch frames.
  - Inputs and buttons: 2px.
  - The nav capsule and info bar: 4px.
  - Round buttons: circular.

### Motion

- Easing `cubic-bezier(0.25, 0.1, 0.25, 1)`. Durations 900–1400ms. Nothing bouncy or fast.
- **One orchestrated moment (hero load):**
  1. The image fades up from basalt (1.4s).
  2. The three headline lines rise in almost at once (80, 200 and 320ms delays). Keep these delays short: long delays push back first paint and LCP.
  3. The bronze arc draws once (starts at 700ms, 1.6s long), then its lights appear.
  4. The CTA row and info bar fade in (900ms delay).

  The embossed monogram is **not** animated. It is often the LCP element.
- **Scroll:**
  - Photos reveal with a slow vertical mask wipe and ±6% parallax, via `animation-timeline: view()`.
  - The `reveal` directive is an IntersectionObserver fallback for browsers without scroll timelines.
  - Text gets only a soft 8px fade, never staggered outside the hero.
- **Hover:**
  - Links: a hairline underline grows from the left.
  - Buttons: a 10% bronze fill.
  - Photos: scale to 1.03 over 1.2s.
  - Round buttons: the border brightens to `bronze-light`.
- **Nav capsule:** fully transparent over the hero top, then basalt at 72% opacity with a backdrop blur once scrolled.
- **`prefers-reduced-motion: reduce`:** all motion is off and content is visible immediately.

### Signature & adapted elements

1. **Bronze arc (`nyx-arc`).** Inline SVG. Appears in the hero (beside the CTA) and atop each membership invitation. The same curve defines the arch frames.
2. **Floating nav capsule (`nyx-header`).** A slim framed bar centred at the top with a hairline border.
   - Desktop: NYX wordmark left · "Private fitness club, Worli" centre · Menu and **Book a tour** right.
   - Mobile: wordmark and Menu only.
3. **Hero info bar.** A framed hairline strip pinned to the bottom of the hero, carrying real information: *Worli, Mumbai | Open until midnight | Instagram*. It collapses to one line on mobile, with the location and Instagram links.
4. **Embossed monogram** (in `hero.ts`, `.emboss` class). A large Bodoni "NYX" relief at about 5% contrast. The face colour sits just above basalt, with two **unblurred** text-shadows (light up-left, dark down-right). Blurred shadows on glyphs this size are too costly to paint. No blackletter. When the real hero arrives, retune its colour or blend mode so it reads over the photo.
5. **Arch frame (`nyx-arch-frame`).** A tall image with a semicircular top. A circular cut-out at the lower corner (CSS `mask` with a radial gradient) holds a 56px round bronze-outline button, such as "Watch the club film" or a coach profile.
   - Used **only** for the Club portrait and coach photos. Facilities stay full-bleed rectangles.
   - The round button carries an icon plus a visible or `aria-label` text label. Never a bare "→".
6. **One stat.** In The Club, in Bodoni: **"150"** with "members. Never more." It's the only number on the page.

### Other components

- **Button (`.btn` class; `.btn-round` for the notch button):** a 1px accent outline (`bronze` on dark, `bronze-deep` on plaster, automatically) with an Archivo 500 tracked label. Never append "→".
- **Photo (`nyx-photo`):** wraps `NgOptimizedImage`. With no `src`, it renders a basalt block with a hairline border and a centred label such as `PHOTO — Pool at dawn, 2400×1600`.
- **Invitation:** a cream card on plaster with a double hairline frame in `line-dark` and the arc on top.
  - Tier name in Bodoni, two lines of copy.
  - An included-items list in hairline rows.
  - An "Enquire" link.
- **Testimonial placeholder:** a dashed hairline box labelled `PLACEHOLDER — member quote, name, membership year`. The quote is set in Bodoni when real.

### Avoid (generic tells)

- Single accented words in headlines.
- Eyebrow labels above every heading.
- 01/02/03 numbering on content that isn't a sequence.
- "→" in buttons.
- Middle-dot meta strings.
- Identical rounded card grids.
- Monospace labels.
- Fade-up on every section.
- More than one stat.

## 5. Sitemap & homepage

Routes: `/` · `/club` · `/facilities` · `/training` · `/membership` · `/visit` · `/privacy` · `/terms`

```
┌──────────────────────────────────────────────────┐
│   ┌ NYX ── Private fitness club, Worli ── Menu  [Book a tour] ┐   floating nav capsule
│                                                  │
│  (hero video/photo, full-bleed, edges melt into   │
│   basalt; embossed NYX monogram behind)           │
│                                                  │
│   A QUIETER                                      │   Archivo Expanded 600, stacked uppercase,
│   KIND OF                                        │   on the image's quiet side
│   STRENGTH.                                      │
│   ⌒  [ Book a Private Tour ]                     │
│  ┌ Worli, Mumbai │ Open until midnight │ Instagram ┐   hero info bar
└──────────────────────────────────────────────────┘
```

Homepage sections, in order:

1. **Hero (dark):** full-screen video or photo (100svh), the floating nav capsule, the embossed monogram, the stacked headline **"A QUIETER / KIND OF / STRENGTH."**, one button (**"Book a Private Tour"**) with the arc, and the info bar.
2. **The Club (plaster):**
   - A short story of the space and its philosophy.
   - The Club portrait in an **arch frame**, with a "Watch the club film" round button.
   - The **"150 / members. Never more."** stat in Bodoni.
3. **Facilities (dark):** strength floor, recovery suite, sauna & steam, pool, studio, lounge. Six alternating full-bleed rows, each a large image with two lines of copy. No numbering.
4. **Training (monsoon):**
   - Personal training and small-group classes as prose.
   - Coach photos in **arch frames** with name and speciality.
   - The coaches scroll sideways on mobile, with scroll snap.
5. **Membership (plaster):**
   - Three tiers presented as invitations on cream card:
     - **Dusk:** weekday access.
     - **Nocturne:** full access, recovery suite, two coached sessions a month.
     - **Eclipse:** founding membership, limited to 150, dedicated coach, private locker.
   - No prices: "Fees shared on enquiry."
   - Each ends with **"Enquire"**.
6. **Testimonials (dark):** clearly marked placeholders.
7. **Visit (dark):** address, opening hours (placeholder: Mon–Sat 5:00–24:00, Sun 7:00–21:00), a click-to-load map and the tour form.
8. **Footer (basalt):** contact details, social links, legal links.

## 6. Copy rules

- Short, understated sentences. Sentence case (except the hero headline).
- Sell the experience and the result, not the equipment list.
- CTAs say exactly what happens: "Book a Private Tour", "Enquire", "Send request".
- Errors say what's wrong and how to fix it. They never apologise.
- **All copy lives in `content/site.ts`.** Never hard-code copy in templates.

## 7. Coding conventions

- Standalone components only. `changeDetection: ChangeDetectionStrategy.OnPush`. Use `input()` / `output()` / `computed()` / `signal()`, and `inject()` instead of constructor injection.
- Selector prefix `nyx-`. One component per file. Prefer inline templates under about 60 lines.
- Style with Tailwind utilities in templates. `@layer components` in `styles.css` is only for a few named patterns used in more than one place (`.btn`, `.link-line`, `.wordmark`, `.invitation-frame`, `.arch-frame`, `.emboss`). Watch selector specificity: never mix element selectors with component classes for spacing.
- Light sections set a `data-surface="light"` attribute. Components read surface-aware tokens (`--fg`, `--accent`, `--hairline`) from it rather than branching in templates.
- **Browser-only code** (window, document, IntersectionObserver, video, analytics, Turnstile) runs only inside `afterNextRender` or behind `isPlatformBrowser`, so prerendering never breaks.
- TypeScript `strict`, no `any`. angular-eslint and Prettier with `prettier-plugin-tailwindcss`.
- **No secrets in the repo.** Public config (site URL, form endpoint, Turnstile site key, analytics token, phone/email/Instagram) lives in `.env` (git-ignored; template in `.env.example`). `scripts/set-env.mjs` generates the git-ignored `src/environments/*.ts`; host env vars override `.env`. `%NYX_SITE_URL%` / `%NYX_PHONE%` tokens in `index.html`, `robots.txt` and `sitemap.xml` are filled post-build, and the form origin is added to `connect-src`. Production builds fail on placeholder values when `CI=true` or `NYX_STRICT=true`.

## 8. Performance budgets (a merge is blocked if one is exceeded)

| Metric | Budget |
|---|---|
| Initial JS (gzip) | ≤ 130 KB. Note that `angular.json` budgets measure **raw** bytes: they warn at 400 kB and error at 460 kB raw, which corresponds to roughly 110–125 KB gzip |
| Initial CSS (gzip) | ≤ 20 KB |
| LCP (mobile, 4G) | ≤ 2.0 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.05 |
| Lighthouse (mobile) | ≥ 95 for Performance, Accessibility, Best Practices and SEO |

How:
- Lazy-loaded routes.
- **Incremental hydration:** on the homepage, Club, Facilities, Training and Membership use `@defer (on viewport; hydrate on viewport)`. Testimonials use `hydrate never`. The tour form uses `@defer (on viewport; hydrate on viewport)`. HTML is prerendered either way, and event replay covers early clicks.
- `NgOptimizedImage` everywhere, using `fill` + `sizes`. A custom `IMAGE_LOADER` maps to the pre-generated WebP widths (640/1080/1600/2400). The hero image has `priority`.
- **Tried and rejected:** `content-visibility: auto` on sections. It broke `@defer (on viewport)` and anchor scrolling to the form, and showed no measurable gain.

**Last measurement (16 Nov 2026, local production build, Lighthouse 12 mobile, 8 runs):**
- Accessibility 100, Best Practices 100, SEO 100.
- Performance 72–89. FCP about 2.2 s, LCP about 2.8 s, CLS 0.
- TBT swung between 160 and 3,400 ms across identical runs, which points to machine noise.
- **The ≥ 95 performance target is not yet verified.** Re-measure on the deployed CDN (PageSpeed Insights) before launch. Next levers: LCP render delay on the hero, and the framework chunk (about 58 KB gzip).
- The hero video is muted and `playsinline`, with a poster image. It's only attached in the browser on wide screens with motion allowed; otherwise the poster shows.
- Map iframe loads only on click.
- Embeds never shift the layout. Third-party scripts are minimal, `async` and justified.

## 9. Scale, caching & resilience

**Why this scales:** the whole site is static files on a CDN. A traffic spike is served from edge caches and never reaches an application server. The only dynamic path is the tour form (section 10).

`public/_headers`:
- `/*.js`, `/*.css`, `/media/*` → `Cache-Control: public, max-age=31536000, immutable` (file names are hashed).
- HTML → `Cache-Control: public, max-age=0, must-revalidate`, so the CDN serves cached copies and revalidates. This is the Cloudflare Pages default, so `_headers` deliberately sets **no** `Cache-Control` on `/*`: Pages merges headers from every matching rule and joins duplicates with a comma, which would break the immutable rules below.
- `/images/*` → `Cache-Control: public, max-age=2592000`.
- `/fonts/*` → `Cache-Control: public, max-age=31536000, immutable`.
- Security headers on every page:
  - A strict `Content-Security-Policy` allowing only self, Turnstile, the map origin, Cloudflare analytics and the form endpoint, with `frame-ancestors 'none'`. `script-src` uses **hashes** of Angular's inline scripts, written after each build by `scripts/csp-hashes.mjs`. Angular's `autoCsp` can't be used together with prerendering. Add the form endpoint's origin to `connect-src` when it's configured.
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**Deploys** are atomic, with a preview URL for every PR and one-click rollback to the previous deploy.

**Graceful degradation:**
- All content is readable with JavaScript disabled, because the pages are prerendered.
- If the form endpoint fails, the form shows the club's phone number and WhatsApp link.

## 10. Tour form contract

**Fields:**

| Field | Rule |
|---|---|
| Name | 2–80 characters |
| Phone | Indian mobile, `^(\+91[\s-]?)?[6-9]\d{9}$` |
| Email | Valid email |
| Preferred date | Today or later |
| Slot | `morning` / `afternoon` / `evening` |
| Interest (optional) | `tour` / `dusk` / `nocturne` / `eclipse`. Pre-filled when the visitor clicks "Enquire" on a tier |
| Hidden | Honeypot field `company` and Turnstile token |

The phone number is sent normalised, with spaces and hyphens removed.

**Request:** `POST {environment.tourEndpoint}` with a JSON body and the header `Idempotency-Key: <uuid>`. The key is generated once per form session and reused on retry.

**Responses:**

| Status | UI |
|---|---|
| `201` | Success: "Request received. We'll call you within one working day." |
| `422` | Map the field errors back onto the inputs |
| `429` | "Too many attempts. Try again in a minute or call us." |
| `5xx` / timeout | Fallback message with phone and WhatsApp |

**Client behaviour (`tour-api.service.ts`):**
- 10 s timeout.
- One retry with backoff, only on network errors or 5xx.
- Submit is disabled while sending, so a double submit isn't possible.
- Never log PII.
- With no endpoint configured: simulate success in dev only. In production, return `unavailable` (phone/WhatsApp fallback) so no lead is silently lost.

**The endpoint must** (it's implemented outside this repo, e.g. a serverless function):
- Validate on the server.
- Verify the Turnstile token.
- Rate-limit per IP (for example, 5 requests per 10 minutes).
- Deduplicate by idempotency key.
- Store or forward the lead.
- Never log PII in plain text.

## 11. Accessibility (WCAG 2.2 AA)

- Contrast as listed in section 4. Use the surface-correct tokens: `bronze` on dark, `bronze-deep` on plaster.
- A visible 2px focus ring on every interactive element: bronze on dark, `bronze-deep` on plaster.
- Skip link, semantic landmarks, one `h1` per page (the hero headline) and a logical heading order.
- Mobile menu: a native `<dialog>` with a focus trap, Esc to close and focus returned to the trigger.
- Every input has a `<label>`. Errors are linked via `aria-describedby`, and focus moves to the first error on submit.
- Touch targets of at least 44×44px, round buttons included.
- Every image has meaningful alt text, placeholders included. The embossed monogram is decorative (`aria-hidden`). The video is silent and has a pause control.
- Text over the hero image meets 4.5:1 wherever it sits. Add a local scrim if the measured contrast falls short.

## 12. SEO

- Per-route title, meta description, canonical URL and Open Graph/Twitter tags via `SeoService`.
- `HealthClub` (schema.org LocalBusiness) JSON-LD with name, address, geo, opening hours, telephone, URL and image.
- `sitemap.xml` and `robots.txt` in `public/`.
- Prerendered HTML, so crawlers see the full content.

## 13. Observability

- **Done:** the Cloudflare Web Analytics beacon (cookieless, production only, loaded when `cfAnalyticsToken` is set). It reports Core Web Vitals (LCP, INP, CLS) itself, so no `web-vitals` library is needed.
- **To do:**
  - Error tracking (for example Sentry) with PII scrubbing enabled.
  - Form submit success and error counts as events.

## 14. Testing & CI

**Status (16 Nov 2026):**
The full test plan is in **`TESTING.md`**.
- **Unit and component (run, passing):** 273 tests across 26 files, including Turnstile render/reset/re-render via the `TURNSTILE_SITE_KEY` token. Coverage is 97.5% of statements and 95.2% of branches. The thresholds in `angular.json` are 85/80/85/85. `src/test-setup.ts` fills jsdom gaps (dialog, matchMedia, IntersectionObserver); `src/app/testing/render.ts` is the shared render helper.
- **Build scripts (run, passing):** 35 Node tests in `scripts/test/`.
- **Lint and format check pass.**
- **E2E (written, type-checked, not yet run):** 300 Playwright tests (100 per viewport, plus visual) in `e2e/`. They run against `dist/e2e`, a production build whose form endpoint is `https://forms.nyx.test/tour`. Every test intercepts it; the fixture blocks all other external requests and fails on any console error.
  - home, navigation (keyboard, menu dialog), tour form (every response status, timeout, idempotency, honeypot, pre-fill), SEO and no-JS, motion and reduced motion, performance guards.
- **Accessibility:** `e2e/a11y.spec.ts` uses `@axe-core/playwright` (WCAG 2.2 AA) and expects zero violations on dark and plaster sections, the open menu, form errors, alerts, success and the legal pages.
- **Visual regression:** `npm run e2e:visual`. There are no baselines yet: generate them with `-u` once the design is approved.
- **Lighthouse CI:** `lighthouserc.json` enforces section 8. It is expected to fail on performance until section 8's open item is fixed.
- **Known testing limit:** Turnstile can't be tested against the fake domain. Check it by hand on the preview deploy.
- **Load:** `load/tour.k6.js`
  - Ramps the form endpoint to 200 requests per second.
  - Asserts 429 behaviour and p95 under 500 ms.
  - Static pages get only a CDN smoke check.
- **CI (GitHub Actions, `.github/workflows/ci.yml`, done):**
  - `quality` (lint, `format:check`, `npm audit --omit=dev --audit-level=high`) and `test` (`test:coverage` + `test:scripts`) run in parallel. `build` and `e2e` run only if both pass.
  - `e2e`: `npm run e2e:build`, then Playwright (non-visual) on Chrome. Both deploy jobs need `build` **and** `e2e`.
  - `lighthouse`: `npm run lhci` on the `site` artifact. It is a required check in branch protection, but deploys don't wait for it, because performance isn't yet at target (section 8).
  - `build`: strict production build (`NYX_STRICT=true`, values from GitHub repo **variables**), then `npm run verify:dist` (`scripts/verify-dist.mjs`: routes exist; no `%NYX_` tokens, `nyx.example`, localhost or source maps; security headers and hashed CSP present). Uploads `dist/nyx/browser` as an artifact.
  - `deploy-preview` (same-repo PRs): Cloudflare Pages branch `pr-<number>`, then a smoke test. `deploy-production` (push to `main`): the `production` GitHub environment (add required reviewers for approval), then a smoke test of routes and security headers.
  - Deploys use `wrangler pages deploy` with the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets and the `CF_PAGES_PROJECT` variable. Turn off Cloudflare's own Git build so the site doesn't deploy twice.
  - Dependabot (`.github/dependabot.yml`) opens weekly update PRs for npm packages and Actions.

## 15. Definition of done (every step)

- [ ] Matches the design system (section 4) and copy rules (section 6). Nothing copied from the reference screenshots.
- [ ] Responsive at 375, 768 and 1440px. The mobile version feels as premium as desktop.
- [ ] Fully keyboard-operable. Reduced motion respected.
- [ ] Budgets pass. Zero axe violations. No console or hydration errors. Lint and tests green.
- [ ] Placeholders clearly labelled. Any supplied assets went through the section 17 pipeline.
- [ ] `CLAUDE.md` updated if any decision changed.
- [ ] Never claim a check passed unless it was actually run.

## 16. Decisions log

| ADR | Decision | Reason |
|---|---|---|
| 1 | Angular + Tailwind CSS v4 | User's choice |
| 2 | Static prerender + CDN, no server runtime | Scales to high traffic at near-zero cost and risk |
| 3 | CSS-only motion | Small JS footprint and smoother performance on low-end phones |
| 4 | Form endpoint lives outside the frontend, bound by section 10 | Keeps the frontend static; the endpoint scales and rate-limits independently |
| 5 | Reference vibe adapted: hybrid type (Archivo Expanded + Bodoni), dark with light pauses, nav capsule, info bar, embossed monogram, arch frames, one stat | User's inspiration screenshots, adapted rather than copied; Jost dropped to keep two families |
| 6 | `basalt` is retuned to the supplied hero's deepest shadow | The hero melts into the page instead of sitting in a box |
| 7 | Self-host fonts (Latin subset, preloaded) instead of Google Fonts | Removes a third-party connection on the critical path, and simplifies the CSP and privacy |
| 8 | Incremental hydration for below-the-fold sections | Less JS work at load; blocking time fell in testing |
| 9 | CSP script hashes generated post-build, not `autoCsp` | `autoCsp` is incompatible with prerendering; hashes avoid `'unsafe-inline'` |
| 10 | WebP only, via a static `IMAGE_LOADER` | Universal support, no image CDN needed. Add AVIF via `<picture>` later only if measurements justify it |

## 17. Assets

The user supplies real assets. Originals go in `sources/` (never deployed).

| Asset | Spec |
|---|---|
| Hero video (optional) | MP4 (H.264) + WebM, 1920×1080, 8–15 s seamless loop, no audio, ≤ 6 MB |
| Hero still / poster | ≥ 2880×1800, dark-toned |
| Club portrait | ≥ 1600×2000 (4:5), subject works inside an arch crop |
| Facilities ×6 | ≥ 2400×1600 (3:2) |
| Coaches | ≥ 1200×1500 (4:5), consistent lighting |
| Logo | SVG if available. Otherwise an NYX wordmark in Archivo Expanded |
| Social share image | 1200×630. `public/og.png` is currently a generated placeholder (wordmark + arc) |

**On receiving any asset, analyse it before using it:**
1. **Tone:**
   - Sample the deepest shadow and the brightest metallic highlight.
   - Retune `basalt` (and `monsoon` proportionally) to the hero's shadow.
   - Confirm `bronze` sits in harmony with the highlights.
   - Re-check every contrast ratio afterwards.
2. **Composition:**
   - Find the focal point and the quiet area.
   - Put the hero text on the quiet side.
   - Set `object-position` so the focal point survives 375px and 768px crops.
3. **Legibility:** measure contrast wherever text overlaps the image, and add a local scrim only if it's below 4.5:1.
4. **Optimise:** put originals in `sources/assets/`, then run `npm run images` (`scripts/optimize-images.mjs`, sharp).
   - **Images:** WebP at 640 / 1080 / 1600 / 2400px widths, named `public/images/<name>-<width>.webp`. The script also prints shadow, highlight and mean colours for step 1.
   - **Video:** the poster frame plus a compressed loop go in `public/media/` (`hero.mp4` + `hero.webm`). This is a manual step for now.
5. **Wire up:** update the paths and alt text in `content/site.ts`, then remove that asset's placeholder label.
6. **Report:** tell the user what was found (tone, focal point, any scrim or crop decision).
