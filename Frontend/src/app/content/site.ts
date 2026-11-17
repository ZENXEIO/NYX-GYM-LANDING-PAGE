/**
 * ALL site copy and content lives here (CLAUDE.md §6).
 * Image `src` values are base paths produced by `npm run images`
 * (e.g. '/images/hero' → /images/hero-1600.webp). Leave `src` empty
 * to show a labelled placeholder.
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
  lines: [string, string];
  image: SiteImage;
}

export interface Coach {
  name: string;
  speciality: string;
  image: SiteImage;
  placeholder: boolean;
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

  /** Phone, email and Instagram come from .env (NYX_*). PLACEHOLDER: address. */
  contact: {
    placeholder: true,
    addressLines: ['Level 12, Placeholder Tower', 'Dr Annie Besant Road', 'Worli, Mumbai 400018'],
    area: 'Worli, Mumbai',
    phoneDisplay: environment.contact.phoneDisplay,
    phoneHref: `tel:${environment.contact.phone}`,
    whatsappHref: `https://wa.me/${environment.contact.phone.replace(/\D/g, '')}`,
    email: environment.contact.email,
    instagram: environment.contact.instagram,
    mapQuery: 'Worli, Mumbai',
  },

  /** PLACEHOLDER hours. */
  hours: [
    { days: 'Monday to Saturday', time: '5:00 – 24:00' },
    { days: 'Sunday', time: '7:00 – 21:00' },
  ],
  hoursShort: 'Open until midnight',

  hero: {
    lines: ['A quieter', 'kind of', 'strength.'],
    cta: 'Book a Private Tour',
    image: {
      src: '',
      alt: 'The NYX training floor at night, lit low',
      label: 'Hero',
      spec: 'dark-toned, ≥ 2880×1800',
      focus: '60% 50%',
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
      src: '',
      alt: 'A member resting between sets in the NYX lounge',
      label: 'Club portrait',
      spec: '4:5, ≥ 1600×2000',
      focus: '50% 30%',
    } satisfies SiteImage,
    action: { label: 'Explore the facilities', fragment: 'facilities' },
  },

  facilities: {
    heading: 'Room to train. Room to recover.',
    intro: 'Six spaces, each with one purpose, and none of them crowded.',
    items: [
      {
        id: 'strength',
        name: 'Strength floor',
        lines: ['Racks, platforms and room to move.', 'Nobody waiting on your bench.'],
        image: {
          src: '',
          alt: 'Bronze-lit squat racks on the strength floor',
          label: 'Strength floor',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'recovery',
        name: 'Recovery suite',
        lines: ['Cold plunge, compression and massage.', 'The work that makes the work count.'],
        image: {
          src: '',
          alt: 'Cold plunge pool in the recovery suite',
          label: 'Recovery suite',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'sauna',
        name: 'Sauna and steam',
        lines: ['Cedar heat and eucalyptus steam.', 'Ten minutes that settle the whole day.'],
        image: {
          src: '',
          alt: 'Cedar-lined sauna with soft amber light',
          label: 'Sauna and steam',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'pool',
        name: 'Pool',
        lines: ['Twenty-five metres, lit low.', 'Swim before the city wakes.'],
        image: {
          src: '',
          alt: 'Still lap pool at dawn',
          label: 'Pool at dawn',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'studio',
        name: 'Studio',
        lines: [
          'Small classes, a sprung floor, soft light.',
          'Mobility, Pilates and conditioning.',
        ],
        image: {
          src: '',
          alt: 'Empty studio with a sprung wooden floor',
          label: 'Studio',
          spec: '3:2, ≥ 2400×1600',
        },
      },
      {
        id: 'lounge',
        name: 'Lounge',
        lines: ['Coffee, cold-pressed juice and quiet.', 'Stay as long as you like.'],
        image: {
          src: '',
          alt: 'Members’ lounge with low chairs and city views',
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
    /** PLACEHOLDER coaches — replace names, specialities and photos. */
    coaches: [
      {
        name: 'Aarav Mehta',
        speciality: 'Strength and conditioning',
        placeholder: true,
        image: {
          src: '',
          alt: 'Portrait of coach Aarav Mehta',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
        },
      },
      {
        name: 'Naina Kapoor',
        speciality: 'Pilates and mobility',
        placeholder: true,
        image: {
          src: '',
          alt: 'Portrait of coach Naina Kapoor',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
        },
      },
      {
        name: 'Kabir Rao',
        speciality: 'Performance and rehabilitation',
        placeholder: true,
        image: {
          src: '',
          alt: 'Portrait of coach Kabir Rao',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
        },
      },
      {
        name: 'Zoya Iyer',
        speciality: 'Swimming and endurance',
        placeholder: true,
        image: {
          src: '',
          alt: 'Portrait of coach Zoya Iyer',
          label: 'Coach portrait',
          spec: '4:5, ≥ 1200×1500',
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
    /** Placeholders until real member quotes are supplied. */
    slots: 2,
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
    legal: [
      { label: 'Privacy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
    ],
  },

  /** PLACEHOLDER legal pages until the client supplies approved text. */
  legal: {
    privacy: {
      title: 'Privacy',
      description: 'How NYX collects, uses and protects your personal information.',
    },
    terms: {
      title: 'Terms',
      description: 'The terms that apply to using the NYX website and booking a tour.',
    },
  },

  seo: {
    home: {
      title: 'NYX — Private fitness club in Worli, Mumbai',
      description:
        'NYX is a private fitness club in Worli, Mumbai. Personal training, recovery, pool and sauna for a capped membership. Book a private tour.',
    },
  },
};
