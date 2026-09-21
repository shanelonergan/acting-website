/**
 * The single source of truth for credits. Now Playing, the Resume credits
 * list, and Gallery captions are all derived from this array — adding a
 * production here makes it appear in all three.
 *
 * Transcribed from Shane's AEA resume (Shane MT Resume-9.pdf), in the order
 * it lists them, which is roughly most-recent-first. That order is
 * deliberate and is preserved: undated entries keep their array order.
 *
 * The resume carries no years, so nothing here has run dates. Anything you
 * want to appear under Now Playing needs `startDate`/`endDate` added — see
 * README.md.
 */

export type ProductionCategory = "theatre" | "concert" | "directing" | "film-tv";

export type Production = {
  title: string;
  role: string;
  /** e.g. "u/s Judas" */
  understudy?: string;
  category: ProductionCategory;
  company: string;
  venue?: string;
  city?: string;
  director?: string;
  choreographer?: string;
  /** ISO dates (YYYY-MM-DD); drive the Now Playing logic. */
  startDate?: string;
  endDate?: string;
  ticketUrl?: string;
  /** Short qualifier shown under the credit, e.g. "World premiere". */
  blurb?: string;
  /** Production artwork, shown beside the entry in Now Playing. */
  poster?: { src: string; width: number; height: number; alt: string };
  images?: { src: string; alt: string; credit?: string }[];
  featured?: boolean;
  /**
   * Position in Now Playing's "Recently" list (lowest first) while no credit
   * has run dates. Lets that list be hand-picked without reordering this
   * array, which would also reorder the resume. Ignored once dates exist.
   */
  recentOrder?: number;
};

export const productions: Production[] = [
  // ---------------------------------------------------------------- theatre
  {
    title: "Jesus Christ Superstar",
    role: "Swing",
    understudy: "u/s Judas",
    category: "theatre",
    company: "Goodspeed Musicals",
    poster: { src: "/images/posters/jcs-goodspeed.jpg", width: 399, height: 501, alt: "Goodspeed Musicals poster for Jesus Christ Superstar" },
    recentOrder: 1,
    director: "Tatiana Pandiani",
  },
  {
    title: "Jesus Christ Superstar",
    role: "Ensemble",
    category: "theatre",
    company: "Broadway Sacramento",
    poster: { src: "/images/posters/jcs-sacramento.jpg", width: 399, height: 501, alt: "Broadway Sacramento poster for Jesus Christ Superstar" },
    recentOrder: 3,
    director: "Glenn Casale",
  },
  {
    title: "Jesus Christ Superstar",
    role: "Simon",
    understudy: "u/s Judas",
    category: "theatre",
    company: "Asolo Rep",
    poster: { src: "/images/posters/jcs-asolo.jpg", width: 776, height: 1200, alt: "Asolo Rep poster for Jesus Christ Superstar" },
    recentOrder: 4,
    city: "Sarasota, FL",
    director: "Josh Rhodes",
    choreographer: "Josh Rhodes",
    featured: true,
    images: [
      {
        src: "/images/hero/jcs-asolo.jpg",
        alt: "Shane Lonergan as Simon in Jesus Christ Superstar at Asolo Rep",
        credit: "Adrian Van Stee",
      },
    ],
  },
  {
    title: "Rent",
    role: "Roger",
    category: "theatre",
    company: "Cain Park",
    city: "Cleveland Heights, OH",
    director: "Nathan Henry",
    poster: {
      src: "/images/posters/rent-cain-park.jpg",
      width: 1200,
      height: 630,
      alt: "Cain Park poster for Rent",
    },
  },
  {
    title: "Rock of Ages",
    role: "Drew",
    category: "theatre",
    company: "Cain Park",
    city: "Cleveland Heights, OH",
    director: "Joanna Hunkins",
  },
  {
    title: "Spring Awakening",
    role: "Melchior",
    category: "theatre",
    company: "Oberlin College",
  },
  {
    title: "Heathers: The Musical",
    role: "J.D.",
    category: "theatre",
    company: "Beck Center for the Arts",
    director: "Scott Spence",
  },
  {
    title: "The Landing",
    role: "Ben/Denny",
    category: "theatre",
    company: "Oberlin College",
    // Kept verbatim from the resume: "asst John Kander". Its exact meaning
    // (assistant to, or assisted by) isn't clear from the PDF — confirm.
    blurb: "asst. John Kander",
  },
  {
    title: "Next to Normal",
    role: "Gabe Goodman",
    category: "theatre",
    company: "Oberlin College",
  },
  {
    title: "Treasure Island",
    role: "Billy Bones",
    category: "theatre",
    company: "Oberlin Summer Theatre Festival",
  },
  {
    title: "What We Look Like",
    role: "Robert/Stephen",
    category: "theatre",
    company: "Oberlin College",
    director: "Benjamin Tindal",
    blurb: "World premiere",
  },

  // -------------------------------------------------------------- directing
  {
    title: "Spring Awakening",
    role: "Director",
    category: "directing",
    company: "Exit Left Theater Company",
  },

  // --------------------------------------------------- workshops & concerts
  {
    // Not on the AEA resume PDF (it postdates it). The photographer's files
    // date the concert to 2026-01-23, but that's inferred from a filename, so
    // no run dates until Shane confirms — which is also why it doesn't appear
    // under Now Playing.
    title: "The History of Natasha, Pierre, and The Great Comet of 1812",
    role: "Dolokhov / Guitar",
    category: "concert",
    company: "54 Below",
    city: "New York, NY",
  },
  {
    title: "Cafe Berlin",
    role: "The Painter",
    category: "concert",
    company: "29-hour reading",
    recentOrder: 2,
    poster: {
      src: "/images/posters/cafe-berlin.jpg",
      width: 269,
      height: 187,
      alt: "Artwork for Cafe Berlin, a new musical",
    },
  },
  {
    title: "The Broadway Boys",
    role: "Performer",
    category: "concert",
    company: "The Broadway Boys",
    venue: "US tours",
  },
  {
    title: "Hair (concert)",
    role: "Claude",
    category: "concert",
    company: "The Musical Theatre Project",
    city: "Cleveland, OH",
    poster: {
      src: "/images/posters/hair-tmtp.jpg",
      width: 822,
      height: 1200,
      alt: "Poster for Hair: The American Tribal Love-Rock Musical",
    },
  },
  {
    title: "Broadway Through the Ages",
    role: "Guitarist / vocalist",
    category: "concert",
    company: "Music at MoCA",
  },
  {
    title: "Something Wonderful",
    role: "Headliner / guitarist",
    category: "concert",
    company: "The Princeton Festival",
    blurb: "Virtual benefit",
  },
];
