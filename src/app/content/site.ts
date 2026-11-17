/**
 * ALL site copy and content lives here (CLAUDE.md §6).
 * Image `src` values are base paths produced by `npm run images`
 * (e.g. '/images/hero' → /images/hero-1600.webp). Leave `src` empty
 * to show a labelled placeholder.
 *
 * SAMPLE CONTENT (17 Nov 2026): the address, facility floors, coaches, member quotes, partner and press names and legal
 * text were written to make the site feel real before launch. They are not
 * real. Replace them with approved details before going live; member quotes in
 * particular must come from real members, with their consent (CLAUDE.md §17).
 */

import { environment } from '../../environments/environment';

export interface SiteImage {
  /** Base path without width/extension, e.g. '/images/pool'. Empty = placeholder. */
  src?: string;
  alt: string;
  /** Placeholder label: what photo belongs here. */
  label: string;
  /** Recommended source size, shown on the placeholder. */
  spec: string;
  /** CSS object-position for the focal point, e.g. '60% 40%'. */
  focus?: string;
}

export interface Facility {
  id: string;
  name: string;
  /** Where it is in the club, shown in the floor directory (SAMPLE until the real layout is known). */
  where: string;
  lines: [string, string];
  image: SiteImage;
}

export interface Coach {
  name: string;
  speciality: string;
  /** One sentence, shown under the speciality. */
  bio: string;
  image: SiteImage;
}

export interface Testimonial {
  quote: string;
  name: string;
  /** e.g. 'Nocturne member since 2026'. */
  detail: string;
}

/** A partner or press logo for the slider under the quotes. */
export interface Partner {
  /** Name, shown as a text wordmark until a logo is supplied; then the logo's alt text. */
  name: string;
  /** A brand partner (Archivo wordmark) or a publication (Bodoni masthead). */
  kind: 'partner' | 'press';
  /** Path to a one-colour SVG in public/images/partners/. Empty = text wordmark. */
  logo: string;
}

/** Opening hours as data, in Mumbai time. Minutes from midnight; 1440 = midnight. */
export interface OpeningSlot {
  /** 0 = Sunday … 6 = Saturday. */
  days: number[];
  opens: number;
  closes: number;
}

export type TierId = 'dusk' | 'nocturne' | 'eclipse';

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  copy: string;
  includes: string[];
}

export interface NavLink {
  label: string;
  fragment: string;
}

export const site = {
  name: 'NYX',
  descriptor: 'Private fitness club, Worli',

  nav: [
    { label: 'The Club', fragment: 'club' },
    { label: 'Facilities', fragment: 'facilities' },
    { label: 'Training', fragment: 'training' },
    { label: 'Membership', fragment: 'membership' },
    { label: 'Visit', fragment: 'visit' },
  ] satisfies NavLink[],

  header: {
    cta: 'Book a tour',
    menu: 'Menu',
    close: 'Close',
  },

  /** Phone, email and Instagram come from src/environments/config.ts. SAMPLE address. */
  contact: {
    addressLines: ['Level 3, Sea Crest House', 'Dr Annie Besant Road', 'Worli, Mumbai 400018'],
    area: 'Worli, Mumbai',
    phoneDisplay: environment.contact.phoneDisplay,
    phoneHref: `tel:${environment.contact.phone}`,
    whatsappHref: `https://wa.me/${environment.contact.phone.replace(/\D/g, '')}`,
    email: environment.contact.email,
    instagram: environment.contact.instagram,
    mapQuery: 'Dr Annie Besant Road, Worli, Mumbai 400018',
  },

  hours: [
    { days: 'Monday to Saturday', time: '5:00 – 24:00', dayNumbers: [1, 2, 3, 4, 5, 6] },
    { days: 'Sunday', time: '7:00 – 21:00', dayNumbers: [0] },
  ],
  hoursShort: 'Open until midnight',
  /** Drives the live "Open now" line in the hero and "Today" in Visit. Keep in step with `hours`. */
  schedule: [
    { days: [1, 2, 3, 4, 5, 6], opens: 5 * 60, closes: 24 * 60 },
    { days: [0], opens: 7 * 60, closes: 21 * 60 },
  ] satisfies OpeningSlot[],
  status: {
    openUntil: 'Open now, until {time}',
    opensToday: 'Opens today at {time}',
    opensTomorrow: 'Opens tomorrow at {time}',
    midnight: 'midnight',
    today: 'Today',
  },

  hero: {
    lines: ['A quieter', 'kind of', 'strength.'],
    image: {
      src: '/images/hero',
      alt: 'The NYX training floor at night: a loaded barbell lit low in bronze, with the lights of Marine Drive through the window',
      label: 'Hero',
      spec: 'dark-toned, ≥ 2880×1800',
      // The barbell's left plate and the rack survive a 375px portrait crop;
      // the window and city lights come in from 768px.
      focus: '66% 55%',
    } satisfies SiteImage,
    /** Optional looping video (base path, e.g. '/media/hero' → hero.webm + hero.mp4). */
    video: '',
    film: { play: 'Play film', pause: 'Pause film' },
  },

  club: {
    heading: 'A club, not a crowd.',
    paragraphs: [
      'NYX is a private club for people who would rather train than be seen training. Three floors above Worli, designed around quiet, space and time.',
      'Membership is capped, so the floor is never crowded and your coach knows your name, your history and your next goal.',
      'Come at five, before the city wakes, or at eleven, when it finally slows down. The lights stay on until midnight.',
    ],
    stat: { value: '150', caption: 'members. Never more.' },
    image: {
      src: '/images/club',
      alt: 'A member resting on a dark oak bench, towel over one shoulder, looking out at the lights of Marine Drive',
      label: 'Club portrait',
      spec: '4:5, ≥ 1600×2000',
      focus: '50% 40%',
    } satisfies SiteImage,
    action: { label: 'Explore the facilities', fragment: 'facilities' },
  },

  facilities: {
    heading: 'Room to train. Room to recover.',
    intro: 'Six spaces, each with one purpose, and none of them crowded.',
    /** Accessible name of the floor directory beside the rooms. */
    directoryLabel: 'Rooms',
    items: [
      {
        id: 'strength',
        name: 'Strength floor',
        where: 'Level 3',
        lines: ['Racks, platforms and room to move.', 'Nobody waiting on your bench.'],
        image: {
          src: '/images/strength',
          alt: 'Two squat racks on basalt platforms on the strength floor, lit low in bronze, with Marine Drive through the window',
          label: 'Strength floor',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'recovery',
        name: 'Recovery suite',
        where: 'Level 4',
        lines: ['Cold plunge, compression and massage.', 'The work that makes the work count.'],
        image: {
          src: '/images/recovery',
          alt: 'A still cold-plunge pool set in dark basalt in the recovery suite, beside a window over Marine Drive at night',
          label: 'Recovery suite',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'sauna',
        name: 'Sauna and steam',
        where: 'Level 4',
        lines: ['Cedar heat and eucalyptus steam.', 'Ten minutes that settle the whole day.'],
        image: {
          src: '/images/sauna',
          alt: 'Cedar-lined sauna benches glowing amber from below, with a drift of steam',
          label: 'Sauna and steam',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'pool',
        name: 'Pool',
        where: 'Level 5, rooftop',
        lines: ['Twenty-five metres, lit low.', 'Swim before the city wakes.'],
        image: {
          src: '/images/pool',
          alt: 'The lap pool at dawn, lit low, with the sea and the city beyond floor-to-ceiling windows',
          label: 'Pool at dawn',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'studio',
        name: 'Studio',
        where: 'Level 3',
        lines: [
          'Small classes, a sprung floor, soft light.',
          'Mobility, Pilates and conditioning.',
        ],
        image: {
          src: '/images/studio',
          alt: 'The studio at dusk: oak Pilates reformers and mats on a warm wooden floor, the bay beyond the windows',
          label: 'Studio',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'lounge',
        name: 'Lounge',
        where: 'Level 5',
        lines: ['Coffee, cold-pressed juice and quiet.', 'Stay as long as you like.'],
        image: {
          src: '/images/lounge',
          alt: 'Leather armchairs and a stone table with juice and coffee in the members’ lounge, Marine Drive lit up below',
          label: 'Lounge',
          spec: '3:2, ≥ 2400×1600',
        },
      },
    ] satisfies Facility[],
  },

  training: {
    heading: 'Coached, not counted.',
    modes: [
      {
        title: 'Personal training',
        copy: 'One coach and one plan, built around your body, your schedule and what you want next. Sessions are private, and progress is measured rather than guessed.',
      },
      {
        title: 'Small groups',
        copy: 'Four to eight people, never more. Strength, conditioning and mobility classes that feel personal, because they almost are.',
      },
    ],
    coachesHeading: 'The coaches',
    /** SAMPLE coaches, with AI-generated stand-in portraits. Replace both with the real coaches before launch. */
    coaches: [
      {
        name: 'Aarav Mehta',
        speciality: 'Strength and conditioning',
        bio: 'Twelve years coaching lifters, from a first deadlift to national meets.',
        image: {
          src: '/images/coach-aarav',
          alt: 'Portrait of coach Aarav Mehta',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
          focus: '50% 30%',
        },
      },
      {
        name: 'Naina Kapoor',
        speciality: 'Pilates and mobility',
        bio: 'Trained in London, she believes a good session leaves you taller, not tired.',
        image: {
          src: '/images/coach-naina',
          alt: 'Portrait of coach Naina Kapoor',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
          focus: '50% 30%',
        },
      },
      {
        name: 'Kabir Rao',
        speciality: 'Performance and rehabilitation',
        bio: 'A physiotherapist first, he brings athletes and desk-bound backs back to full strength.',
        image: {
          src: '/images/coach-kabir',
          alt: 'Portrait of coach Kabir Rao',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
          focus: '50% 30%',
        },
      },
      {
        name: 'Zoya Iyer',
        speciality: 'Swimming and endurance',
        bio: 'A former state swimmer who coaches the dawn lane five days a week.',
        image: {
          src: '/images/coach-zoya',
          alt: 'Portrait of coach Zoya Iyer',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
          focus: '50% 30%',
        },
      },
    ] satisfies Coach[],
  },

  membership: {
    heading: 'Membership is by invitation.',
    intro:
      'Three ways to belong. Each begins with a private tour and a conversation, never a sales pitch.',
    feesNote: 'Fees are shared on enquiry.',
    cta: 'Enquire',
    tiers: [
      {
        id: 'dusk',
        name: 'Dusk',
        tagline: 'For the working week.',
        copy: 'Weekday access from five until midnight, before or after the office.',
        includes: [
          'Weekday access',
          'Sauna and steam',
          'The lounge',
          'A quarterly progress review',
        ],
      },
      {
        id: 'nocturne',
        name: 'Nocturne',
        tagline: 'The whole club, every day.',
        copy: 'Every room at every hour, with two coached sessions each month.',
        includes: [
          'Seven-day access',
          'Recovery suite and pool',
          'Studio classes',
          'Two coached sessions a month',
        ],
      },
      {
        id: 'eclipse',
        name: 'Eclipse',
        tagline: 'The founding membership.',
        copy: 'Limited to forty members, with a dedicated coach and first call on everything new.',
        includes: [
          'Everything in Nocturne',
          'A dedicated coach',
          'A private locker',
          'Guest privileges',
        ],
      },
    ] satisfies Tier[],
  },

  testimonials: {
    heading: 'In their words.',
    /** SAMPLE quotes. Replace with real members' words, with their consent, before launch. */
    quotes: [
      {
        quote:
          'I used to train at six in the morning because it was the only time the gym was empty. Here it is always that quiet.',
        name: 'Ananya S.',
        detail: 'Nocturne member since 2026',
      },
      {
        quote:
          'My coach noticed my shoulder before I did. Six months on, I am lifting more than I did at thirty.',
        name: 'Rohan M.',
        detail: 'Eclipse member since 2026',
      },
      {
        quote:
          'It feels less like a gym and more like a very good hotel that happens to have a squat rack.',
        name: 'Meera D.',
        detail: 'Dusk member since 2026',
      },
    ] satisfies Testimonial[],
    /** Pause control for the two sliders (WCAG 2.2.2). */
    motion: {
      label: 'Pause the moving quotes and logos',
      pause: 'Pause',
      play: 'Play',
    },
    quotesLabel: 'Member quotes',
    partners: {
      heading: 'Partners and press',
      /**
       * SAMPLE names, deliberately fictional: not real brands or publications.
       * Before launch replace them with real partners and real press coverage,
       * with permission, plus their logos (SVG, one colour). Never put a real
       * brand's name here unless the relationship is real: it implies an
       * endorsement or coverage that does not exist.
       */
      items: [
        { name: 'Saltwick Recovery', kind: 'partner', logo: '' },
        { name: 'Monsoon Quarterly', kind: 'press', logo: '' },
        { name: 'Kestrel & Vane', kind: 'partner', logo: '' },
        { name: 'The Coastline Review', kind: 'press', logo: '' },
        { name: 'Ondra Cold Therapy', kind: 'partner', logo: '' },
        { name: 'Meridian Weekend', kind: 'press', logo: '' },
      ] satisfies Partner[],
    },
  },

  visit: {
    heading: 'Visit the club.',
    intro:
      'Tours are private and take about forty minutes. Tell us when suits you and we will call to confirm.',
    hoursHeading: 'Opening hours',
    addressHeading: 'Address',
    contactHeading: 'Contact',
    mapLabel: 'Show map',
    mapNote: 'Loads Google Maps.',
    form: {
      heading: 'Book a private tour',
      /** Shown while the form's JavaScript loads, before "{phone}". */
      loadingCall: 'Or call',
      submit: 'Send request',
      sending: 'Sending',
      success: 'Request received. We will call you within one working day.',
      startAgain: 'Book another tour',
      fallbackCall: 'Call',
      fallbackWhatsapp: 'Message on WhatsApp',
      rateLimited: 'Too many attempts. Try again in a minute or call us.',
      unavailable:
        'The form is not responding right now. Call or message us instead and we will book your tour.',
      /** No form endpoint yet: the request is finished on WhatsApp, already written out. */
      handoff: {
        heading: 'One last step',
        text: 'Your request is written out for you. Send it to us on WhatsApp and we will reply to confirm your tour.',
        cta: 'Continue on WhatsApp',
        edit: 'Change details',
        /** The pre-filled message. {name} {date} {slot} {interest} are replaced. */
        message:
          'Hello NYX, I would like to book a private tour.\nName: {name}\nDate: {date}\nTime: {slot}\nInterested in: {interest}',
      },
      /** Shown under "Send request" (DPDP Act 2023: notice at the point of collection). */
      privacy: {
        text: 'We use your details only to arrange your visit.',
        link: 'Privacy',
      },
      slots: [
        { value: 'morning', label: 'Morning' },
        { value: 'afternoon', label: 'Afternoon' },
        { value: 'evening', label: 'Evening' },
      ],
      interests: [
        { value: 'tour', label: 'A tour only' },
        { value: 'dusk', label: 'Dusk membership' },
        { value: 'nocturne', label: 'Nocturne membership' },
        { value: 'eclipse', label: 'Eclipse membership' },
      ],
      errors: {
        name: 'Enter your name (2 to 80 characters).',
        phone: 'Enter a 10-digit Indian mobile number, e.g. 98200 12345.',
        email: 'Enter an email address, e.g. name@example.com.',
        date: 'Choose today or a later date.',
        slot: 'Choose a time of day.',
      },
    },
  },

  footer: {
    tagline: 'A private fitness club in Worli. Open until midnight.',
    /** Writes itself in once the necklace of lights has closed (scroll-linked). */
    signOff: 'Tap into a newer you.',
    /** The card that slides out of the footer when the bronze button is pressed. */
    invitation: {
      label: 'Your invitation',
      open: 'Open your invitation',
      close: 'Close your invitation',
      title: 'An evening at NYX',
      text: 'Come and see the club at the hour you would train. A private tour takes forty minutes, and no one will try to sell you anything.',
      cta: 'Book a tour',
      dismiss: 'Close',
    },
    legal: [
      { label: 'Privacy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
    ],
  },

  /** Unknown addresses (/404, served as 404.html with a real 404 status). */
  notFound: {
    title: 'This page is not here',
    text: 'The address may have changed, or the link was mistyped. Everything about the club is on the homepage.',
    home: 'Back to the homepage',
    cta: 'Book a tour',
    seoTitle: 'Page not found — NYX',
    description:
      'This page does not exist. Find the club, membership and tours on the NYX homepage.',
  },

  seo: {
    home: {
      title: 'NYX — Private fitness club in Worli, Mumbai',
      description:
        'NYX is a private fitness club in Worli, Mumbai. Personal training, recovery, pool and sauna for a capped membership. Book a private tour.',
    },
  },
};
