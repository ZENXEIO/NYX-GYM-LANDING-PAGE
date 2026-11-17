/**
 * Legal page text (/privacy, /terms). Split from site.ts so it loads only with
 * those pages, not in every page's initial bundle (CLAUDE.md §6, §8).
 *
 * SAMPLE text, written to match what this site actually does. Have a lawyer
 * review it before launch (CLAUDE.md §1).
 */

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export const legal = {
  privacy: {
    title: 'Privacy',
    description: 'How NYX collects, uses and protects your personal information.',
    updated: '17 November 2026',
    intro:
      'NYX respects your privacy. This page explains what we collect when you use this website or book a tour, why we collect it and the choices you have. It is written with the Digital Personal Data Protection Act, 2023 in mind.',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [
          'When you book a tour we ask for your name, mobile number, email address, a preferred date and time of day and, if you choose, the membership you are interested in.',
          'We do not use advertising cookies. Our website analytics count visits without cookies and without identifying you.',
        ],
      },
      {
        heading: 'Why we use it',
        paragraphs: [
          'We use your details only to arrange and confirm your tour, to answer your enquiry and, if you join, to manage your membership. We never sell your information or share it for marketing.',
        ],
      },
      {
        heading: 'Who else sees it',
        paragraphs: [
          'A small number of trusted providers help us run the site: Cloudflare hosts it and protects the form from automated abuse, and our booking system stores tour requests. Each handles your data only on our instructions.',
          'The map in the Visit section loads from Google only when you choose to show it.',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          'Tour requests are kept for twelve months and then deleted, unless you become a member. Member records are kept for as long as your membership lasts, and afterwards for as long as the law requires.',
        ],
      },
      {
        heading: 'Your rights',
        paragraphs: [
          'You can ask to see, correct or delete the personal information we hold about you, or withdraw your consent at any time. Write to us at the email address in the footer and we will reply within thirty days.',
        ],
      },
    ] satisfies LegalSection[],
  },
  terms: {
    title: 'Terms',
    description: 'The terms that apply to using the NYX website and booking a tour.',
    updated: '17 November 2026',
    intro:
      'These terms apply when you use this website or book a tour of NYX. By using the site you agree to them. Membership itself is covered by a separate agreement, which you receive before you join.',
    sections: [
      {
        heading: 'Booking a tour',
        paragraphs: [
          'Tours are free, private and take about forty minutes. A request is confirmed only when we call or message you to agree a time. If you cannot make it, let us know and we will gladly rearrange.',
          'Tours cover the training floor and the recovery spaces. Comfortable clothes are welcome, but there is no workout.',
        ],
      },
      {
        heading: 'Membership and fees',
        paragraphs: [
          'Fees are shared on enquiry and confirmed in writing before you join. Membership is capped, so a place cannot always be offered straight away.',
        ],
      },
      {
        heading: 'Using this website',
        paragraphs: [
          'Please use the site lawfully and do not try to disrupt it or misuse the booking form. We may change the site, these terms or our opening hours at any time; the version published here is the one that applies.',
        ],
      },
      {
        heading: 'Content and liability',
        paragraphs: [
          'The text, design and photographs on this site belong to NYX. We take care to keep information accurate, but facilities and classes may change. Nothing on this site is medical advice: speak to a doctor before starting a new training programme.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: [
          'These terms are governed by the laws of India, and the courts of Mumbai have jurisdiction over any dispute.',
        ],
      },
    ] satisfies LegalSection[],
  },
};
