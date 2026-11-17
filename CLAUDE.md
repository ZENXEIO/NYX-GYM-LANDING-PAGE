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

- **Placeholders and sample content (changed 17 Nov 2026 at the user's request):**
  - **Photos:** every image is now filled with an AI-generated picture the user supplied on 17 Nov 2026 (section 17). Only the optional hero video and the **partner and press logos** (labelled placeholders in the Testimonials slider, section 17) are still absent.
  - **Copy is filled with SAMPLE content and has no visible labels:** the address (Level 3, Sea Crest House), the coaches and their bios, three member quotes and draft privacy and terms text. It reads as real but is invented. The header comment in `content/site.ts` says so.
  - **Before launch:** replace the sample address and coaches with real ones. Member quotes must be real members' words, used with their consent: publishing invented reviews breaks Indian consumer-protection rules. Have a lawyer review the legal text.
  - **Contact details stay dummies on purpose** (`+91 00000 00000`, `nyx.example`, instagram.com): an invented number or handle could belong to a real person. The user chose this.
- **Location:** the Angular app lives directly in the git repo root. Do **not** nest it in a subfolder. All paths below are relative to the root.
- **`sources/`** (at the repo root) holds the user's inspiration screenshots and original assets. It is **never deployed** and never served directly.

## 2. Commands (run in the repo root)

| Command                | Purpose                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm start`            | Dev server on http://localhost:4200                                                                                 |
| `npm run build`        | Production build; prerendered output in `dist/nyx/browser`. `postbuild` runs `scripts/csp-hashes.mjs`               |
| `npm run lint`         | angular-eslint                                                                                                      |
| `npm run format`       | Prettier (with Tailwind class sorting)                                                                              |
| `npm run images`       | `scripts/optimize-images.mjs`: turns `sources/assets/` originals into WebP in `public/images/` and prints tone data |
| `npm run format:check` | Prettier check without writing                                                                                      |
| `npm run verify:dist`  | `scripts/verify-dist.mjs`: checks the build output is safe to deploy (section 14)                                   |

## 3. Tech stack & architecture

- **Angular (latest stable)**: standalone components, signals, zoneless change detection, new control flow (`@if` / `@for` / `@defer`), `OnPush` everywhere.
- **Tailwind CSS v4** via `@tailwindcss/postcss` (`.postcssrc.json`). Design tokens are defined **once** in `@theme` in `src/styles.css`.
- **Rendering:** `"outputMode": "static"`. Every route is prerendered to HTML at build time, then hydrated on the client (incremental hydration for `@defer` blocks). **No server runtime.**
- **Hosting:** Cloudflare Pages (global CDN with a Mumbai edge location). `public/_headers` sets caching and security headers. Netlify, Vercel and Firebase Hosting are acceptable alternatives with equivalent config.
- **Not allowed:** UI component libraries, `@angular/animations`, jQuery, GSAP or other motion libraries. **Motion is CSS only.**

```
(repo root)
  sources/                      inspiration + original assets (never deployed)
  src/
    styles.css                  @theme tokens, base layer, @layer components, motion keyframes, reduced-motion
    index.html                  @font-face + font preloads, favicon, HealthClub JSON-LD
    environments/               config.ts (static public config, edited by hand) + environment.ts /
                                environment.development.ts, which only add the `production` flag
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
      layout/                   header (nav capsule + menu <dialog>), footer (+ necklace.ts geometry)
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
  scripts/dist.mjs              shared post-build helpers: distDir(), walk()
  scripts/verify-dist.mjs       post-build check that dist/ is safe to deploy
```

## 4. Design system (source of truth)

**Concept: "Mumbai after dark", confident.** Nyx is the goddess of night. The palette is Deccan basalt and lime plaster. The one signature motif is a fine bronze arc, the curve of Marine Drive's _Queen's Necklace_. The same curve shapes the Deco arch image frames.

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

| Token           | Value                    | Use                                                                                                                                                                                                                         |
| --------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basalt`        | `#0E1011`                | Page base on dark sections. **Retuned 17 Nov 2026 to the hero photo's edge shadows** (left edge `#070909`, bottom `#0D0E0E`; was `#161A1D`) so the image melts into the page. Retune again if the hero changes (section 17) |
| `monsoon`       | `#171B1C`                | Alternate dark surface (Training), form fields. Kept the same step above `basalt` as before (was `#1F2528`)                                                                                                                 |
| `plaster`       | `#EDE6DA`                | Text on dark sections, and the **background of light sections**                                                                                                                                                             |
| `plaster-muted` | `#A9A398`                | Secondary text on dark (≈7.6:1 on basalt, ≈6.9:1 on monsoon)                                                                                                                                                                |
| `ink`           | `#161A1D`                | Text on plaster sections. Not retuned with `basalt`; it is a text colour on light surfaces                                                                                                                                  |
| `ink-muted`     | `#4E4A43`                | Secondary text on plaster (≈7:1). **Never** use `plaster-muted` on plaster                                                                                                                                                  |
| `card`          | `#F6F1E7`                | Invitation card stock on plaster sections                                                                                                                                                                                   |
| `bronze`        | `#B08D57`                | The **only** accent on dark: arc, focus ring, button outline, active link (≈6.2:1 on basalt)                                                                                                                                |
| `bronze-light`  | `#C9A774`                | Bronze hover state on dark only                                                                                                                                                                                             |
| `bronze-deep`   | `#7A5A2E`                | Bronze on plaster sections (≈5.1:1). **Never** use `bronze` on plaster (2.7:1 fails)                                                                                                                                        |
| `line`          | `rgba(237,230,218,0.14)` | Hairlines on dark                                                                                                                                                                                                           |
| `line-dark`     | `rgba(22,26,29,0.16)`    | Hairlines on plaster                                                                                                                                                                                                        |

Rules:

- The accent covers under 2% of any screen.
- No shadows.
- No gradients. The only exceptions are a flat basalt scrim over photos, applied locally and only where text contrast needs it, and the edge fade that melts the hero into basalt.

**Section rhythm (dark with light pauses):**

| Section        | Background                                           |
| -------------- | ---------------------------------------------------- |
| Hero           | dark                                                 |
| **The Club**   | **plaster**                                          |
| Facilities     | dark                                                 |
| Training       | monsoon                                              |
| **Membership** | **plaster** (invitations read like cream card stock) |
| Testimonials   | dark                                                 |
| Visit          | dark                                                 |
| Footer         | basalt                                               |

### Typography (hybrid, two families)

- **Archivo** (Google, variable `wght` + `wdth`) does all the sans work.
  - **Display:** Archivo Expanded (`wdth` ≈ 118), weight 600.
  - **Body and UI:** Archivo at `wdth` 100, weights 400 and 500.
- **Bodoni Moda** (400, roman) is used **only** for editorial moments: membership tier names, member quotes and the single club stat.
- Both are **self-hosted** from `public/fonts/` (Latin subset woff2, SIL OFL 1.1). `@font-face` is inline in `index.html` with `font-display: swap`, and both files are preloaded. There is no third-party font request.
- Surface-aware utilities: `text-fg`, `text-fg-muted`, `text-accent`, `border-hairline` and `bg-placeholder` switch automatically inside `[data-surface='light']`.

| Role                            | Face                 | Mobile → Desktop | Leading / tracking |
| ------------------------------- | -------------------- | ---------------- | ------------------ |
| Hero (stacked, **uppercase**)   | Archivo Expanded 600 | 48 → 128px       | 0.95 / −0.01em     |
| H2                              | Archivo Expanded 600 | 34 → 72px        | 1.02 / −0.005em    |
| H3                              | Archivo Expanded 500 | 22 → 30px        | 1.15               |
| Editorial (tiers, quotes, stat) | Bodoni Moda 400      | 32 → 64px        | 1.1                |
| Body large                      | Archivo 400          | 19 → 21px        | 1.55               |
| Body                            | Archivo 400          | 17px             | 1.6, max 62ch      |
| Label                           | Archivo 500          | 12px             | uppercase, +0.2em  |

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
  3. The info bar fades in (900ms delay).

  The hero has **no CTA button and no arc** (removed 17 Nov 2026 at the user's request). Do not add them back.

  The embossed monogram is **not** animated. It is often the LCP element.

- **Footer closing moment (17 Nov 2026, ADR 17):** inspired by a user-supplied "string tie" envelope footer, rebuilt from NYX's own motifs rather than copied.
  - As the footer scrolls in, the Queen's Necklace (a bronze curve) draws itself from the lower left towards a round bronze button, and its streetlights come on one by one. Once it closes, "See you after dark." writes itself in and the button's ring brightens.
  - **CSS only:** a view timeline animates one registered property, `--p` (0 to 1), on `.necklace`; the line, lights, sign-off and the button's colour are all `calc()` of it. Without scroll timelines, or with reduced motion, `--p` stays at its initial value of 1 and the footer shows complete.
  - The top edge of a cream invitation card peeks above the contact panel. The button slides the card up, with "Book a tour" (to `/#visit`), the phone number and Close. Focus moves into the card; Esc or Close returns it to the button. The card is `inert` while tucked away. On phones the button steps aside while the card is open.
  - Geometry (`layout/necklace.ts`) is pure maths, evaluated at build time, so the footer prerenders complete.
- **Scroll:**
  - Photos reveal with a slow vertical mask wipe and ±6% parallax, via `animation-timeline: view()`.
  - The `reveal` directive is an IntersectionObserver fallback for browsers without scroll timelines.
  - Text gets only a soft 8px fade, never staggered outside the hero.
- **Section by section (17 Nov 2026, ADR 18).** Each section has one signature motion. Premium comes from restraint: slow, scroll-scrubbed, one moment per screen, the language of being let in. All of it lives in `styles.css` (keyframes `nyx-*`, inside the `no-preference` + `@supports (animation-timeline: view())` block), so without scroll timelines or with reduced motion everything shows complete.
  - **Club:** the arch opens from its base to its crown and the photo eases from 1.08 (`.arch-open`). The stat's hairline draws (`.rule-draw`), "150" settles its tracking (`.track-settle`) and the caption follows (`.after-settle`).
  - **Facilities:** a 55% basalt veil lifts as each room is reached (`.lights-on`); the caption arrives just after its photo (`.caption-follow`).
  - **Training:** the mode hairlines draw. From 768px the coaches rise into the row (`.coach-rise`) and the offset column drifts ±16px (`.coach-drift`). On phones the swiped-to coach is at full presence and neighbours recede (`.carousel-focus`, `view(inline)`).
  - **Membership:** each invitation is presented (`.card-present`), its arc draws (`nyx-arc [scroll]`, `.arc-scroll`) and the tier name settles. **Only Eclipse** gets a seal: its inner frame traces itself in `bronze-deep` (`.frame-seal`). Hover warms every inner frame to `bronze-deep`. After "Enquire", the pre-filled interest field gets one slow bronze outline (`.flash` in `tour-form.ts`).
  - **Testimonials:** an infinite slider (ADR 19, replaces the earlier written-in quotes). The quotes drift left; a row of partner and press logos drifts right, more slowly. See "Infinite slider" below.
  - **Visit:** a bronze marker grows down today's hours row, with the breathing dot. The map fades in. Inputs grow a bronze bottom hairline on focus; "Send request" crossfades to "Sending…"; the success message fades in under an arc that draws itself; errors fade in, never shake.
  - **Between pages:** Angular view transitions crossfade routes over 900ms (`withViewTransitions` in `app.config.ts`). Jumps within the same page skip it.
  - **Gotcha:** an `overflow: hidden` box is a scroll container, so a plain `view()` on anything inside it never moves. Inner layers use the outer frame's **named** timeline (`--photo` on `.photo-reveal`, `--arch` on `.arch-open`).
  - **Not used, on purpose:** count-ups, typewriter or letter-by-letter text, cursor effects, scroll-jacking, sheens and glows, and content hidden behind hover.
- **Hover:**
  - Links: a hairline underline grows from the left.
  - Buttons: a 10% bronze fill.
  - Photos: scale to 1.03 over 1.2s.
  - Round buttons: the border brightens to `bronze-light`.
- **Nav capsule:** fully transparent over the hero top, then basalt at 72% opacity with a backdrop blur once scrolled.
- **`prefers-reduced-motion: reduce`:** all motion is off and content is visible immediately.

### Signature & adapted elements

1. **Bronze arc (`nyx-arc`).** Inline SVG. Appears atop each membership invitation and the footer invitation card (no longer in the hero). The same curve defines the arch frames, and a long version of it is the footer's necklace.
2. **Floating nav capsule (`nyx-header`).** A slim framed bar centred at the top with a hairline border.
   - Desktop: NYX wordmark left · "Private fitness club, Worli" centre · Menu and **Book a tour** right.
   - Mobile: wordmark and Menu only.
   - **Menu (changed 17 Nov 2026):** a compact panel that drops down under the capsule, not a full-screen page. The page stays visible behind a light basalt scrim. It lists the homepage sections, then the phone number and Instagram.
     - Every item **scrolls to its section on the homepage**: smoothly, or instantly with reduced motion. It never opens a separate page.
     - From `/privacy` or `/terms`, an item returns to the homepage, waits until every section has rendered, then jumps.
     - Links keep real `/#section` hrefs, so they work without JavaScript and with Ctrl/Cmd-click.
     - The header's **Book a tour** button uses the same scroll.
   - **Live opening status:** the info bar shows "Open now, until midnight" (with a slowly breathing bronze dot) or "Opens tomorrow at 5:00", computed in Mumbai time from `site.schedule` (`core/open-status.ts`) and refreshed every minute. The prerendered HTML shows the static `hoursShort` line; the live line is set after render, so hydration never mismatches. The Visit hours list marks today's row with "Today" the same way.
3. **Hero info bar.** A framed hairline strip pinned to the bottom of the hero, carrying real information: _Worli, Mumbai | Open until midnight | Instagram_. It collapses to one line on mobile, with the location and Instagram links.
4. **Embossed monogram** (in `hero.ts`, `.emboss` class). A large Bodoni "NYX" relief at about 5% contrast. The face is **transparent** so the hero photo shows through, with two **unblurred** text-shadows (light up-left at 6%, dark down-right at 22%). Because the face is transparent, the shadows read as a faint darkening of the glyph with a light and a dark rim. Blurred shadows on glyphs this size are too costly to paint. No blackletter. (Retuned 17 Nov 2026: the old solid `#191D20` face blocked the photo.)
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
- **Testimonial:** a member quote in Bodoni under a hairline rule, with the name and membership in a caption. The quotes sit in the infinite slider. The current three are SAMPLE quotes (section 1).
- **Infinite slider (`.marquee`, 17 Nov 2026, ADR 19):** the user asked for the style of the 21st.dev "infinite-slider" (React + framer-motion). Rebuilt here as CSS only, not installed.
  - Markup in `testimonials.ts`: `.marquee` > `.marquee-track` > four `.marquee-set` copies of the items. The track moves by half its width (`nyx-marquee`), so the loop is seamless. Items carry their gap as `margin-inline-end` (`--marquee-gap`) so the halves are exact. Speed is `--marquee-duration` (two copies per loop): quotes 160s, logos 120s, about 20 px/s. Keep it slow.
  - Only the first copy is exposed: the others are `aria-hidden` and `inert`. No links inside the slider.
  - Full bleed, hard edges: no gradient edge fade (section 4, colour rules).
  - Pauses on hover and focus, and with the **Pause / Play** toggle beside the heading (WCAG 2.2.2). The toggle is a checkbox (`.marquee-toggle`), so it works in a section that is never hydrated, and without JavaScript.
  - Reduced motion: no movement, no toggle, copies hidden; the row scrolls by hand with snap.
  - This is the one continuous animation outside the breathing dot. Don't add more.

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
│  ┌ Worli, Mumbai │ Open until midnight │ Instagram ┐   hero info bar
└──────────────────────────────────────────────────┘
```

Homepage sections, in order:

1. **Hero (dark):** full-screen video or photo (100svh), the floating nav capsule, the embossed monogram, the stacked headline **"A QUIETER / KIND OF / STRENGTH."**, and the info bar. No button or arc: booking is reached from the header's **Book a tour** (desktop) or the menu (mobile).
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
6. **Testimonials (dark):** three member quotes in a slow infinite slider (sample content until real ones are supplied, section 1), then a counter-drifting row of partner and press logos (placeholders until supplied, section 17).
7. **Visit (dark):** address, opening hours (placeholder: Mon–Sat 5:00–24:00, Sun 7:00–21:00), a click-to-load map and the tour form.
8. **Footer (basalt):** the closing moment (necklace of lights, "See you after dark.", invitation card), then contact details, social links, legal links.

## 6. Copy rules

- Short, understated sentences. Sentence case (except the hero headline).
- Sell the experience and the result, not the equipment list.
- CTAs say exactly what happens: "Book a tour", "Enquire", "Send request".
- Errors say what's wrong and how to fix it. They never apologise.
- **All copy lives in `content/site.ts`.** Never hard-code copy in templates.

## 7. Coding conventions

- Standalone components only. `changeDetection: ChangeDetectionStrategy.OnPush`. Use `input()` / `output()` / `computed()` / `signal()`, and `inject()` instead of constructor injection.
- Selector prefix `nyx-`. One component per file. Prefer inline templates under about 60 lines.
- Style with Tailwind utilities in templates. `@layer components` in `styles.css` is only for a few named patterns used in more than one place (`.btn`, `.link-line`, `.wordmark`, `.invitation-frame`, `.arch-frame`, `.emboss`). Watch selector specificity: never mix element selectors with component classes for spacing.
- Light sections set a `data-surface="light"` attribute. Components read surface-aware tokens (`--fg`, `--accent`, `--hairline`) from it rather than branching in templates.
- **Browser-only code** (window, document, IntersectionObserver, video, analytics, Turnstile) runs only inside `afterNextRender` or behind `isPlatformBrowser`, so prerendering never breaks.
- TypeScript `strict`, no `any`. angular-eslint and Prettier with `prettier-plugin-tailwindcss`.
- **No secrets in the repo, and no `.env`.** Public config (site URL, form endpoint, Turnstile site key, analytics token, phone/email/Instagram) is **static**, in `src/environments/config.ts`, committed and edited by hand. Nothing is generated at build time and no environment variables are read. Everything in that file ships in the browser bundle.
  - The site URL and phone are also written literally in `src/index.html` (JSON-LD), `public/robots.txt` and `public/sitemap.xml`. Change all four together.
  - When the form endpoint is set, add its origin to `connect-src` in `public/_headers` by hand.
  - Nothing blocks a build with placeholder values. `npm run verify:dist` is the only check: it fails while `nyx.example` is in the output.

## 8. Performance budgets (checked by hand; there is no CI, see section 14)

| Metric              | Budget                                                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial JS (gzip)   | ≤ 130 KB. Note that `angular.json` budgets measure **raw** bytes: they warn at 400 kB and error at 460 kB raw, which corresponds to roughly 110–125 KB gzip |
| Initial CSS (gzip)  | ≤ 20 KB                                                                                                                                                     |
| LCP (mobile, 4G)    | ≤ 2.0 s                                                                                                                                                     |
| INP                 | ≤ 200 ms                                                                                                                                                    |
| CLS                 | ≤ 0.05                                                                                                                                                      |
| Lighthouse (mobile) | ≥ 95 for Performance, Accessibility, Best Practices and SEO                                                                                                 |

How:

- Lazy-loaded routes.
- **Incremental hydration:** on the homepage, Club, Facilities, Training and Membership use `@defer (on immediate; hydrate on viewport)`. Testimonials use `on immediate; hydrate never`. On first load only the `hydrate` trigger applies, so nothing changes there. `on immediate` matters only when the homepage is reached by client-side navigation (the menu from `/privacy`): every section renders at once, so the jump to a section is not knocked off by sections rendering above it. It was `on viewport` before 17 Nov 2026. The tour form uses `@defer (on viewport; hydrate on viewport)`. HTML is prerendered either way, and event replay covers early clicks.
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

| Field               | Rule                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Name                | 2–80 characters                                                                                  |
| Phone               | Indian mobile, `^(\+91[\s-]?)?[6-9]\d{9}$`                                                       |
| Email               | Valid email                                                                                      |
| Preferred date      | Today or later                                                                                   |
| Slot                | `morning` / `afternoon` / `evening`                                                              |
| Interest (optional) | `tour` / `dusk` / `nocturne` / `eclipse`. Pre-filled when the visitor clicks "Enquire" on a tier |
| Hidden              | Honeypot field `company` and Turnstile token                                                     |

The phone number is sent normalised, with spaces and hyphens removed.

**Request:** `POST {environment.tourEndpoint}` with a JSON body and the header `Idempotency-Key: <uuid>`. The key is generated once per form session and reused on retry.

**Responses:**

| Status          | UI                                                                  |
| --------------- | ------------------------------------------------------------------- |
| `201`           | Success: "Request received. We'll call you within one working day." |
| `422`           | Map the field errors back onto the inputs                           |
| `429`           | "Too many attempts. Try again in a minute or call us."              |
| `5xx` / timeout | Fallback message with phone and WhatsApp                            |

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
- Menu: a native `<dialog>` opened with `showModal()`, styled as a drop-down panel. It has a focus trap, closes with Esc, the Close button or a click on the backdrop, and returns focus to the trigger.
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

**There are no automated tests and no CI pipeline.** Both were removed on 17 Nov 2026 at the user's request. Do not add them back unless the user asks.

**Removed:**

- Unit and component tests (`src/**/*.spec.ts`, `src/test-setup.ts`, `src/app/testing/`), the `test` target in `angular.json` and `tsconfig.spec.json`.
- Build-script tests (`scripts/test/`).
- Playwright and axe end-to-end tests (`e2e/`, `playwright.config.ts`, `scripts/e2e-build.mjs`).
- Lighthouse CI config (`lighthouserc.json`) and the k6 load script (`load/`).
- The GitHub Actions workflow (`.github/workflows/ci.yml`) and `TESTING.md`.
- The dev dependencies only they used: `vitest`, `@vitest/coverage-v8`, `jsdom`, `@playwright/test`, `@axe-core/playwright`, `serve`.
- Everything is still in git history (commit `79b258c`, "Version 2") if it is wanted again.

**What still checks the code (all run by hand):**

- `npm run lint` (angular-eslint) and `npm run format:check` (Prettier).
- `npm run build`: TypeScript strict and Angular strict templates, the bundle budgets in `angular.json`.
- `npm run verify:dist` after a build: every route is prerendered; no `nyx.example`, localhost or source maps; security headers and a hashed CSP are present.

**Not covered by anything now:** behaviour, accessibility (axe), performance (Lighthouse) and the form's error handling. Check these by hand in a browser before each release (section 15).

**Deploys:** nothing deploys automatically from GitHub. Use Cloudflare Pages' own Git integration, or deploy by hand (build command `npm run build`, output `dist/nyx/browser`). `.github/dependabot.yml` remains, so Dependabot still opens weekly update PRs, with nothing to verify them.

**Open observation from the last test run (17 Nov 2026), not resolved:** the Playwright test that clicks "Enquire" on the Eclipse tier failed twice out of about 36 runs. The click was delivered, but the URL stayed at `/` instead of `/#visit`. The link sits in a `hydrate on viewport` block, and the test clicked straight after scrolling to it under heavy CPU load. The cause was never established. If it is a click lost during hydration, it is a real bug on the enquiry path. Try it by hand on a slow device.

## 15. Definition of done (every step)

- [ ] Matches the design system (section 4) and copy rules (section 6). Nothing copied from the reference screenshots.
- [ ] Responsive at 375, 768 and 1440px. The mobile version feels as premium as desktop.
- [ ] Fully keyboard-operable. Reduced motion respected.
- [ ] Budgets pass. No accessibility problems, console errors or hydration errors, checked by hand (there are no automated tests, section 14). Lint and format check green.
- [ ] Placeholders clearly labelled. Any supplied assets went through the section 17 pipeline.
- [ ] `CLAUDE.md` updated if any decision changed.
- [ ] Never claim a check passed unless it was actually run.

## 16. Decisions log

| ADR | Decision                                                                                                                                                 | Reason                                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Angular + Tailwind CSS v4                                                                                                                                | User's choice                                                                                                                                                                                                          |
| 2   | Static prerender + CDN, no server runtime                                                                                                                | Scales to high traffic at near-zero cost and risk                                                                                                                                                                      |
| 3   | CSS-only motion                                                                                                                                          | Small JS footprint and smoother performance on low-end phones                                                                                                                                                          |
| 4   | Form endpoint lives outside the frontend, bound by section 10                                                                                            | Keeps the frontend static; the endpoint scales and rate-limits independently                                                                                                                                           |
| 5   | Reference vibe adapted: hybrid type (Archivo Expanded + Bodoni), dark with light pauses, nav capsule, info bar, embossed monogram, arch frames, one stat | User's inspiration screenshots, adapted rather than copied; Jost dropped to keep two families                                                                                                                          |
| 6   | `basalt` is retuned to the supplied hero's deepest shadow                                                                                                | The hero melts into the page instead of sitting in a box                                                                                                                                                               |
| 7   | Self-host fonts (Latin subset, preloaded) instead of Google Fonts                                                                                        | Removes a third-party connection on the critical path, and simplifies the CSP and privacy                                                                                                                              |
| 8   | Incremental hydration for below-the-fold sections                                                                                                        | Less JS work at load; blocking time fell in testing                                                                                                                                                                    |
| 9   | CSP script hashes generated post-build, not `autoCsp`                                                                                                    | `autoCsp` is incompatible with prerendering; hashes avoid `'unsafe-inline'`                                                                                                                                            |
| 10  | WebP only, via a static `IMAGE_LOADER`                                                                                                                   | Universal support, no image CDN needed. Add AVIF via `<picture>` later only if measurements justify it                                                                                                                 |
| 11  | The app lives at the git repo root, not in `Frontend/` (17 Nov 2026)                                                                                     | User's choice                                                                                                                                                                                                          |
| 12  | No automated tests and no CI pipeline (17 Nov 2026)                                                                                                      | User's choice. Lint, the build and `verify:dist` are the remaining checks, run by hand                                                                                                                                 |
| 13  | Config is static in `src/environments/config.ts`; no `.env`, no generated files, no build tokens (17 Nov 2026)                                           | User's choice. Costs: the site URL and phone are repeated in three static files, and the CSP `connect-src` is edited by hand                                                                                           |
| 14  | No CTA button or arc in the hero (17 Nov 2026)                                                                                                           | User's choice: they found them distracting. Booking stays one tap away in the header (desktop) and menu (mobile)                                                                                                       |
| 15  | Copy filled with sample content, without visible placeholder labels; photos stay labelled placeholders (17 Nov 2026)                                     | User's choice: "make it feel alive". Must be replaced with real, approved content before launch (section 1)                                                                                                            |
| 16  | The menu is a drop-down panel whose items scroll to homepage sections (17 Nov 2026)                                                                      | User's choice: the full-screen menu felt like opening a new page                                                                                                                                                       |
| 17  | The footer's closing moment (necklace of lights, invitation card) is scroll-linked in CSS (17 Nov 2026)                                                  | User's request, inspired by a reference footer but not copied. A CSS view timeline keeps it inside ADR 3                                                                                                               |
| 18  | One signature scroll-linked motion per section after the hero, plus route crossfades (17 Nov 2026)                                                       | User's request: the page felt static after the hero, and the motion must feel premium and exclusive. CSS only (ADR 3); Eclipse alone gets the seal so it reads as rare                                                 |
| 19  | Testimonials become an infinite slider, with a partner and press logo row (17 Nov 2026)                                                                  | User's request, from the 21st.dev infinite-slider. Rebuilt in CSS (ADR 3) instead of installing React/framer-motion; pausable for WCAG 2.2.2; logos are placeholders because inventing brands would imply endorsements |

## 17. Assets

The user supplies real assets. Originals go in `sources/` (never deployed).

| Asset                 | Spec                                                                                                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero video (optional) | MP4 (H.264) + WebM, 1920×1080, 8–15 s seamless loop, no audio, ≤ 6 MB                                                                                                                                                                                                      |
| Hero still / poster   | ≥ 2880×1800, dark-toned. **Supplied 17 Nov 2026** (AI-generated, `sources/assets/hero.png`): only 1585×992, so the 1600 and 2400 WebP files are 1585px wide and the image is slightly soft on large and high-density screens. Replace with a larger version when available |
| Club portrait         | ≥ 1600×2000 (4:5), subject works inside an arch crop                                                                                                                                                                                                                       |
| Facilities ×6         | ≥ 2400×1600 (3:2)                                                                                                                                                                                                                                                          |
| Coaches               | ≥ 1200×1500 (4:5), consistent lighting                                                                                                                                                                                                                                     |
| Logo                  | SVG if available. Otherwise an NYX wordmark in Archivo Expanded                                                                                                                                                                                                            |
| Partner / press logos | One-colour SVG each (shown in plaster at 70%), with permission to use them. Put them in `public/images/partners/` and set `name` + `logo` in `site.testimonials.partners.items`. Until then the slider shows labelled placeholders. Never invent brand names               |
| Social share image    | 1200×630. `public/og.png` is currently a generated placeholder (wordmark + arc)                                                                                                                                                                                            |

**Hero analysis (17 Nov 2026):**

- **Tone:** near-black, neutral to warm shadows (whole-image mean `#18140F`; left edge `#070909`); highlights are warm bronze-amber from the wall light, the bar and the Marine Drive lights. `bronze` sits in harmony with them. `basalt` and `monsoon` were retuned (section 4).
- **Composition:** the left half and lower third are quiet, so the headline stays bottom-left. The focal point is the barbell, rack and window, right of centre: `focus: '66% 55%'` keeps the left plate and rack at 375px and adds the window and city lights from 768px.
- **Legibility (worst 1% of background pixels behind the headline, with the edge fade applied):** desktop 9.3:1, tablet 11.3:1. On phones the bar's chrome highlight measured 3.5–4.4:1, so a **local scrim** was added: below 768px the bottom fade is taller (`.hero-fade` in `hero.ts`), giving at least 5.7:1 from 360 to 414px wide.
  **All other photos (17 Nov 2026):** AI-generated by the user, originals in `sources/assets/` (club, strength, recovery, sauna, pool, studio, lounge, coach-aarav, coach-naina, coach-kabir, coach-zoya).
- **Size:** portraits are 1122×1402 and facilities 1536×1024, below the specs above, so the larger WebP sizes are not upscaled and look slightly soft on big or high-density screens. The shapes match the frames exactly (4:5 and 3:2), so nothing is cropped.
- **Tone:** shadows near-black, highlights warm bronze, so they sit with the hero and needed no palette change. The pool and studio carry a soft dusk-blue sky, the only cool tone.
- **Coach portraits are AI faces standing in for sample coaches** (section 1). Replace the photos and the names together with the real coaching team before launch. Also: Naina and Zoya were generated with near-identical faces; Kabir's shirt has a small logo mark; Kabir and Zoya look a different age from their bios.

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
