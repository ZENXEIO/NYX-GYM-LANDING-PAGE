import { site } from './site';

/**
 * Content integrity: the copy rules in CLAUDE.md §4 and §6 are checked here, so a
 * content edit that breaks the brand voice or the page wiring fails fast.
 */

/** Every string anywhere in the content tree, with its path. */
function strings(value: unknown, path = 'site'): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => strings(v, `${path}.${k}`));
  }
  return [];
}

const all = strings(site);
const copy = all.filter(([p]) => !/(src|href|instagram|email|phone|mapQuery|path|focus)$/i.test(p));

describe('site content', () => {
  describe('copy rules (CLAUDE.md §4, §6)', () => {
    it('never uses an arrow in copy or CTAs', () => {
      expect(copy.filter(([, s]) => /→|->/.test(s))).toEqual([]);
    });

    it('never uses middle-dot meta strings', () => {
      expect(copy.filter(([, s]) => s.includes('·'))).toEqual([]);
    });

    it('never uses bracketed taglines like "[ A. B. C. ]"', () => {
      expect(copy.filter(([, s]) => /\[\s*\w/.test(s))).toEqual([]);
    });

    it('uses UK spelling for common US variants', () => {
      const us = /\b(color|center|organize|personalized|favorite|program)\b/i;
      expect(copy.filter(([, s]) => us.test(s))).toEqual([]);
    });

    it('has no leftover lorem ipsum or TODO markers', () => {
      expect(copy.filter(([, s]) => /lorem|ipsum|todo|tbd|xxx/i.test(s))).toEqual([]);
    });

    it('error messages say what is wrong and never apologise', () => {
      const errors = [
        ...Object.values(site.visit.form.errors),
        site.visit.form.rateLimited,
        site.visit.form.unavailable,
      ];
      for (const e of errors) {
        expect(e).not.toMatch(/sorry|oops|apolog|unfortunately/i);
        expect(e.length).toBeGreaterThan(10);
      }
    });

    it('contains exactly one stat (only digits-as-number on the page)', () => {
      expect(site.club.stat.value).toBe('150');
      const numeric = copy.filter(([p, s]) => !p.includes('hours') && /^\+?\d[\d,k+]*$/.test(s));
      expect(numeric.map(([p]) => p)).toEqual(['site.club.stat.value']);
    });
  });

  describe('hero', () => {
    it('has the three stacked headline lines', () => {
      expect(site.hero.lines).toEqual(['A quieter', 'kind of', 'strength.']);
    });

    it('CTA says exactly what happens', () => {
      expect(site.hero.cta).toBe('Book a Private Tour');
    });
  });

  describe('navigation wiring', () => {
    it('links to every homepage section by a unique fragment', () => {
      const fragments = site.nav.map((n) => n.fragment);
      expect(fragments).toEqual(['club', 'facilities', 'training', 'membership', 'visit']);
      expect(new Set(fragments).size).toBe(fragments.length);
    });

    it('legal links point to the placeholder routes', () => {
      expect(site.footer.legal.map((l) => l.path)).toEqual(['/privacy', '/terms']);
    });
  });

  describe('facilities', () => {
    it('lists the six spaces in order, with unique ids and two lines each', () => {
      const ids = site.facilities.items.map((f) => f.id);
      expect(ids).toEqual(['strength', 'recovery', 'sauna', 'pool', 'studio', 'lounge']);
      for (const f of site.facilities.items) {
        expect(f.lines).toHaveLength(2);
        expect(f.lines.every((l) => l.trim().length > 0)).toBe(true);
      }
    });
  });

  describe('membership', () => {
    it('has the three tiers in order', () => {
      expect(site.membership.tiers.map((t) => t.id)).toEqual(['dusk', 'nocturne', 'eclipse']);
    });

    it('shows no prices', () => {
      const tierCopy = strings(site.membership).map(([, s]) => s);
      expect(tierCopy.filter((s) => /₹|rs\.?\s?\d|\$|\d{3,}/i.test(s))).toEqual([]);
      expect(site.membership.feesNote).toMatch(/enquiry/i);
    });

    it('every tier can be chosen in the tour form "Interested in" select', () => {
      const interests = site.visit.form.interests.map((i) => i.value);
      expect(interests[0]).toBe('tour');
      for (const t of site.membership.tiers) expect(interests).toContain(t.id);
    });

    it('CTA is "Enquire"', () => {
      expect(site.membership.cta).toBe('Enquire');
    });
  });

  describe('images and placeholders', () => {
    const images = [
      site.hero.image,
      site.club.image,
      ...site.facilities.items.map((f) => f.image),
      ...site.training.coaches.map((c) => c.image),
    ];

    it('every image has meaningful alt text and a placeholder label', () => {
      for (const img of images) {
        expect(img.alt.length).toBeGreaterThan(10);
        expect(img.alt).not.toMatch(/^(image|photo|picture)( of)?\b/i);
        expect(img.label.trim()).not.toBe('');
        expect(img.spec.trim()).not.toBe('');
      }
    });

    it('image sources are empty (placeholder) or a base path without extension', () => {
      for (const img of images) {
        if (img.src) expect(img.src).toMatch(/^\/images\/[a-z0-9-]+$/);
      }
    });

    it('placeholder coaches are flagged so the page labels them', () => {
      for (const c of site.training.coaches) expect(typeof c.placeholder).toBe('boolean');
    });
  });

  describe('contact', () => {
    it('builds tel: and WhatsApp links from the configured phone number', () => {
      expect(site.contact.phoneHref).toMatch(/^tel:\+?\d+$/);
      expect(site.contact.whatsappHref).toMatch(/^https:\/\/wa\.me\/\d+$/);
    });

    it('lists opening hours for the whole week', () => {
      expect(site.hours.map((h) => h.days)).toEqual(['Monday to Saturday', 'Sunday']);
    });
  });

  describe('tour form copy', () => {
    it('has an error message for every validated field', () => {
      expect(Object.keys(site.visit.form.errors).sort()).toEqual(
        ['date', 'email', 'name', 'phone', 'slot'].sort(),
      );
    });

    it('offers the three slots from the form contract (CLAUDE.md §10)', () => {
      expect(site.visit.form.slots.map((s) => s.value)).toEqual([
        'morning',
        'afternoon',
        'evening',
      ]);
    });

    it('submit label says what happens', () => {
      expect(site.visit.form.submit).toBe('Send request');
    });
  });

  describe('SEO copy', () => {
    it('home title and description fit search result limits', () => {
      expect(site.seo.home.title.length).toBeLessThanOrEqual(60);
      expect(site.seo.home.description.length).toBeGreaterThanOrEqual(70);
      expect(site.seo.home.description.length).toBeLessThanOrEqual(160);
    });
  });
});
