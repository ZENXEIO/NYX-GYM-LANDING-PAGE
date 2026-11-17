# NYX — test plan

What is tested, at which layer, and how to run it. The standing rules are in `CLAUDE.md` §8, §10, §11 and §14.

## The layers

| Layer | Tool | Where | Runs on | Command |
|---|---|---|---|---|
| Unit and component | Vitest (jsdom) via `ng test` | `src/**/*.spec.ts` | every save / CI | `npm test` · `npm run test:coverage` |
| Build scripts | Node test runner | `scripts/test/*.test.mjs` | CI | `npm run test:scripts` |
| End-to-end | Playwright, installed Chrome | `e2e/*.spec.ts` | CI (before deploy) | `npm run e2e` |
| Accessibility | axe-core in Playwright | `e2e/a11y.spec.ts` | CI | part of `npm run e2e` |
| Visual regression | Playwright screenshots | `e2e/visual.spec.ts` | on demand | `npm run e2e:visual` |
| Performance budgets | Lighthouse CI | `lighthouserc.json` | CI | `npm run build && npm run lhci` |
| Load (form endpoint) | k6 | `load/tour.k6.js` | before launch, against staging | `k6 run -e TOUR_ENDPOINT=… load/tour.k6.js` |
| Deployed site | curl smoke test | `.github/workflows/ci.yml` | after each deploy | automatic |

**Coverage targets** (enforced in `angular.json`): 85% of statements, 85% of lines, 85% of functions and 80% of branches. Current coverage: 97.5% of statements and 95.2% of branches.

## What each layer covers

### Unit and component (273 tests, 26 files)

| Area | File | Key cases |
|---|---|---|
| Tour form | `tour-form.spec.ts` | labels and types; errors appear only after touch or submit; focus moves to the first error; name 2–80 characters; Indian mobile; past date; normalised request body; UUID idempotency key; "Sending" state and no double submit; 201 success replaces the form; 422 field mapping; 429 and 5xx fallback with call/WhatsApp; the same key is reused on retry and a new key is used after success; the typed details are kept after a failure; "Enquire" pre-fill |
| Validators | `tour-form.validators.spec.ts` | accepted and rejected phone formats; date boundaries at today, across the year and on a leap day; local time, not UTC |
| Form API | `tour-api.service.spec.ts` | 201/422/429/4xx/5xx mapping; one retry only on network errors and 5xx, with the same key; 10 s timeout; honeypot; demo mode in dev; `unavailable` in production; no personal data in the URL |
| Header | `header.spec.ts` | nav landmark; the capsule turns solid on scroll; the dialog opens as a modal, locks scroll, closes from Close, a link or Esc, and returns focus; listeners are cleaned up |
| Sections | `hero`, `club`, `facilities`, `training`, `membership`, `testimonials`, `visit`, `map-embed` specs | one h1; one CTA; decorative monogram; video rules (wide screen, motion allowed, pause control); surfaces; one stat; alternating rows; labelled round buttons; tier `aria-label`s; no prices; placeholders labelled; click-to-load map with encoded query; phone fallback while the form loads |
| Shared | `photo`, `arch-frame`, `arc`, `reveal` specs | placeholder vs optimised image; srcset widths; priority; never sets its own position (regression test); reveal fallback only when needed |
| Pages and routes | `home`, `legal`, `app.routes`, `app` specs | section order; unique ids; valid `aria-labelledby`; SEO per route; lazy routes; unknown URLs redirect; skip link |
| Content rules | `site.spec.ts` | the copy rules from CLAUDE.md §4/§6 as tests: no arrows, no middle dots, UK spelling, one stat, errors never apologise, every tier selectable in the form, alt text present |

### Build scripts (35 tests)

- `set-env.mjs`: `.env` versus host variables; defaults; only public keys are written; placeholders warn locally and **fail in CI**.
- `inject-dist.mjs`: tokens filled; the form origin is added to `connect-src`; idempotent.
- `csp-hashes.mjs`: every inline script is hashed; JSON-LD is skipped; handlers go behind `'unsafe-hashes'`; never `'unsafe-inline'`; idempotent.

### End-to-end (each test runs at 375, 768 and 1440 px)

- `home`: sections and their backgrounds; placeholders; no sideways scroll; 44×44 px touch targets; self-hosted fonts; snap scrolling on mobile; map loads on click.
- `navigation`: skip link; visible focus ring; the menu works by keyboard alone (focus trap, Esc, focus returns, page behind is inert); every nav link; CTAs; deep links; legal pages; back and forward.
- `tour-form`: the happy path with the exact request body and headers; double submit; every error; phone formats; date `min`; the radio group responds to arrow keys; 422, 429, 5xx retry, network failure and timeout; the same key on a manual retry; "Book another tour"; honeypot; "Enquire" for each tier; a keyboard-only submit.
- `a11y`: axe finds zero violations for the page, plaster sections, open menu, form errors, fallback alert, success message, loaded map and legal pages; landmarks; heading order; reflow at 320 px.
- `seo`: the prerendered HTML has the meta tags and full content; valid JSON-LD with no tokens left; robots and sitemap; the page reads correctly **with JavaScript off**.
- `motion`: the hero sequence and its delays; the monogram is static; nothing faster than 600 ms; reduced motion turns everything off.
- `performance`: no third-party requests on load; two font preloads; JS under 130 KB; CLS ≤ 0.05; incremental hydration.

The e2e suite runs against `dist/e2e`, a production build whose form endpoint is a fake host (`forms.nyx.test`). Every test intercepts that endpoint, and the fixture blocks all other external requests and fails the test on any console error.

## Defects these tests found

- **The time-slot radios were not a group.** They had no `name`, so arrow keys didn't move between them and screen readers announced each one as "1 of 1". Fixed in `tour-form.ts`.

## Gaps and limits

- **Not run yet:** the Playwright suite (written and type-checked, 300 tests), the visual baselines (generate with `npm run e2e:visual -- -u`), Lighthouse CI and k6.
- Lighthouse performance is expected to fail locally at 72–89 against the 95 target (CLAUDE.md §8). Measure on the deployed CDN.
- k6 needs the real form endpoint's staging URL. That endpoint is outside this repo.
- Turnstile is not tested end to end, because it can't run against a fake domain. Test it manually on the preview deploy.
- Error tracking (Sentry) does not exist yet, so there is nothing to test.
