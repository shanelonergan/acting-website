/**
 * Site-wide facts that aren't tied to a single production. Edit this file to
 * update the tagline, socials, or hero framing default — no code changes
 * needed elsewhere.
 *
 * PLACEHOLDER values are marked below; see README.md for the full list.
 */

export const site = {
  name: "Shane Lonergan",
  // The canonical address: link previews, the sitemap and robots.txt are
  // built from it. www because that's the form search engines already have
  // from the old Squarespace site; make it the primary domain in Netlify too.
  url: "https://www.shanelonergan.com",
  tagline: "actor · director · musician",
  // From Shane's AEA resume — the professional address, not his personal one.
  email: "shanepatricklonergan@gmail.com",
  // On the resume but deliberately NOT rendered on the page: a phone number
  // in HTML gets scraped. It stays in the downloadable PDF. Set this only if
  // Shane wants it published as text.
  phone: null as string | null,

  /** Union status and casting vitals, straight off the resume. */
  vitals: {
    union: "AEA",
    height: "6'1\"",
    voice: "Tenor with high belt/mix",
  },
  socials: {
    instagram: "https://instagram.com/shanelonergan",
    tiktok: "https://www.tiktok.com/@shane_lonergan",
  },
  representation: { agency: "SW Artists", contact: "Margaret Emory" } as null | {
    agency: string;
    contact: string;
  },

  // Not currently rendered: the About section is cut from the page for now
  // (see app/page.tsx). Kept so it can return. PLACEHOLDER wording — still
  // Shane's to write — but the facts match the resume.
  bio: [
    "Shane Lonergan is a New York–based actor, director, and musician working principally in musical theatre. He is a member of Actors' Equity Association.",
    "He has played Jesus Christ Superstar three times over — as a swing and Judas understudy at Goodspeed Musicals, in the ensemble for Broadway Sacramento, and as Simon and Judas understudy at Asolo Rep. Other roles include Roger in Rent and Drew in Rock of Ages at Cain Park, and J.D. in Heathers: The Musical at Beck Center for the Arts.",
    "He directed Spring Awakening for Exit Left Theater Company, and performs as a guitarist and vocalist in concert. He holds a B.A. in Theatre and Biology from Oberlin College.",
  ],

  // headshot (singular) is only used by the About section, which is
  // currently cut. PLACEHOLDER: still an older file.
  headshot: {
    src: "/images/headshots/headshot-1.jpg",
    alt: "Headshot of Shane Lonergan",
    width: 1920,
    height: 2401,
    // PLACEHOLDER: photographer to confirm.
    credit: undefined as string | undefined,
  },

  headshots: [
    {
      src: "/images/headshots/headshot-1.jpg",
      alt: "Headshot of Shane Lonergan in a tan jacket against a blue-grey background",
      label: "Headshot 1",
    },
    {
      src: "/images/headshots/headshot-2.jpg",
      alt: "Headshot of Shane Lonergan in a blue denim shirt against a navy background",
      label: "Headshot 2",
    },
  ],

  media: {
    /** Acting reel — loaded behind a click-to-play facade, never as an eager iframe. */
    reelYouTubeId: "-WFBIVnEpyI",
    reelTitle: "Jesus Christ Superstar — Judas highlight reel",
    /** The SoundCloud user whose tracks the Media page currently embeds. */
    soundcloudUserId: "337504410",
  },

  /**
   * Self-hosted so the download can't break when the old Squarespace site
   * goes away. Replace the file at this path to update it.
   */
  resumePdf: "/shane-lonergan-resume.pdf",
  resumePdfFilename: "Shane-Lonergan-Resume.pdf",

  /**
   * Formspree endpoint for the contact form. If this is ever set back to
   * null, the form renders visibly disabled rather than pretending to send.
   */
  contactFormEndpoint: "https://formspree.io/f/xoevvppn" as string | null,

  /** Education and teachers, from the resume. */
  education: { degree: "B.A. Theatre & Biology", institution: "Oberlin College" },
  training: [
    {
      label: "Voice",
      detail: "Mike Ruckles, Dr. Brian Gill, Matt Farnsworth, Dr. Gregory Harrell",
    },
    { label: "Acting", detail: "Joan Rosenfels, Matthew Wright, Heather Anderson Boll" },
    { label: "Guitar", detail: "Josh Maxey" },
  ],
  skills: [
    "Rock vocals",
    "Guitar (electric and acoustic, 10 years)",
    "A capella/choral singing (6 years)",
    "Basic tumbling (handstand/rolls/backflip)",
    "Diving",
    "Baseball",
    "Longboarding",
    "Swimming",
    "Bowling",
    "Licensed driver (Michigan)",
    "Software engineering",
  ],
} as const;

export const hero = {
  image: {
    src: "/images/hero/jcs-asolo.jpg",
    width: 2048,
    height: 1366,
    alt: "Shane Lonergan performing as Simon in Jesus Christ Superstar at Asolo Repertory Theatre",
    credit: "Photo: Adrian Van Stee",
    // Keeps Shane framed under the seam in full-bleed mode.
    objectPosition: "46% 44%",
    /**
     * Purpose-made phone crop, cut from Adrian's 8192x5464 original around
     * Shane — it keeps the framing columns and the ensemble either side,
     * which an automatic centre-crop of the wide frame loses. Because it is
     * cut from the full-resolution master rather than the 2048px web copy,
     * it is also far sharper on a phone than cropping the wide file.
     * Composed on Shane, so it wants dead centre.
     */
    mobileSrc: "/images/hero/jcs-asolo-phone.jpg" as string | undefined,
    mobileWidth: 1200,
    mobileHeight: 2341,
    mobileObjectPosition: "50% 50%" as string | undefined,
  },
  /**
   * One-line config swap: 'inset' shows the whole frame with black margins,
   * like a framed print; 'full-bleed' fills the viewport.
   *
   * Both are full-bleed. Inset was the original choice for phones — it keeps
   * the whole composition, including the side light and the ensemble — but
   * in practice the black margins read as padding and cost the opening its
   * immersion, so the crop is the better trade. A portrait viewport keeps
   * roughly the middle third of the frame; `objectPosition` below is what
   * holds Shane inside it.
   */
  framing: {
    mobile: "full-bleed",
    desktop: "full-bleed",
  } as const,
} as const;
