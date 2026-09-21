import type { GalleryImage } from "@/components/Lightbox";

/**
 * Shane's selection, exported from the album at ~/Desktop/Production Photos.
 *
 * Grouped by show, leading with the most recent professional work; Oberlin
 * comes last. Add more with `npm run gallery:add -- <slug> <source.jpg> ...`.
 *
 * `width`/`height` are the exported file's real, upright dimensions: the
 * layout uses them to choose landscape (full width) vs portrait (half, so two
 * pair up), and next/image uses them to reserve space so nothing shifts.
 *
 * PHOTOGRAPHER CREDITS come from the copyright/author fields embedded in the
 * original files. They should be confirmed before launch.
 */
export const gallery: GalleryImage[] = [
  // ---------------------------------------- Jesus Christ Superstar, Asolo Rep
  {
    src: "/images/gallery/jcs-asolo-1.jpg",
    width: 2400,
    height: 1601,
    alt: "Shane Lonergan centre stage, arms outstretched, with the company of Jesus Christ Superstar under a fan of coloured light",
    show: "Jesus Christ Superstar",
    role: "Simon",
    company: "Asolo Repertory Theatre",
    credit: "Adrian Van Stee",
  },
  {
    src: "/images/hero/jcs-asolo.jpg",
    width: 2048,
    height: 1366,
    alt: "Shane Lonergan as Simon, standing centre stage in warm light with the company kneeling around him",
    show: "Jesus Christ Superstar",
    role: "Simon",
    company: "Asolo Repertory Theatre",
    credit: "Adrian Van Stee",
  },
  {
    src: "/images/gallery/jcs-asolo-2.jpg",
    width: 2400,
    height: 1601,
    alt: "The company of Jesus Christ Superstar kneeling on a darkened stage as shafts of pale light fall from above",
    show: "Jesus Christ Superstar",
    role: "Simon",
    company: "Asolo Repertory Theatre",
    credit: "Adrian Van Stee",
  },
  {
    src: "/images/gallery/jcs-asolo-4.jpg",
    width: 2400,
    height: 1600,
    alt: "Shane Lonergan among the company of Jesus Christ Superstar, lit by a cluster of held candles",
    show: "Jesus Christ Superstar",
    role: "Simon",
    company: "Asolo Repertory Theatre",
    credit: "Adrian Van Stee",
  },
  {
    src: "/images/gallery/jcs-asolo-5.jpg",
    width: 2400,
    height: 1600,
    alt: "The company of Jesus Christ Superstar advancing downstage in a line, in near darkness",
    show: "Jesus Christ Superstar",
    role: "Simon",
    company: "Asolo Repertory Theatre",
    credit: "Adrian Van Stee",
  },
  {
    src: "/images/gallery/jcs-asolo-3.jpg",
    width: 2400,
    height: 1601,
    alt: "The Jesus Christ Superstar set in gold light, a lone figure standing at the foot of the steps",
    show: "Jesus Christ Superstar",
    role: "Simon",
    company: "Asolo Repertory Theatre",
    credit: "Adrian Van Stee",
  },

  // ------------------------------------- The Great Comet of 1812, 54 Below
  {
    src: "/images/gallery/great-comet-54-below-1.jpg",
    width: 2400,
    height: 1597,
    alt: "Shane Lonergan singing and playing acoustic guitar with the band at 54 Below, an accordionist beside him",
    show: "The History of Natasha, Pierre, and The Great Comet of 1812",
    role: "Dolokhov / Guitar",
    company: "54 Below",
    // PLACEHOLDER: credit to confirm — the file is named for Grace Copeland.
    credit: undefined,
  },

  // --------------------------------------------------- Rent, Cain Park
  {
    src: "/images/gallery/rent-cain-park-1.jpg",
    width: 800,
    height: 1200,
    alt: "Shane Lonergan as Roger in a studded vest, singing under purple light",
    show: "Rent",
    role: "Roger",
    company: "Cain Park",
    credit: "Colleen Albrecht",
  },
  {
    src: "/images/gallery/rent-cain-park-2.jpg",
    width: 800,
    height: 1200,
    alt: "Shane Lonergan as Roger kneeling with an acoustic guitar in blue light",
    show: "Rent",
    role: "Roger",
    company: "Cain Park",
    credit: "Colleen Albrecht",
  },
  {
    src: "/images/gallery/rent-cain-park-3.jpg",
    width: 1200,
    height: 800,
    alt: "Shane Lonergan as Roger on the scaffolding set of Rent, arms flung wide",
    show: "Rent",
    role: "Roger",
    company: "Cain Park",
    credit: "Colleen Albrecht",
  },
  {
    src: "/images/gallery/rent-cain-park-4.jpg",
    width: 1200,
    height: 800,
    alt: "Shane Lonergan playing guitar beside a table where another performer lies in a patterned coat",
    show: "Rent",
    role: "Roger",
    company: "Cain Park",
    credit: "Colleen Albrecht",
  },
  {
    src: "/images/gallery/rent-cain-park-5.jpg",
    width: 1200,
    height: 800,
    alt: "The company of Rent raising cups around a table",
    show: "Rent",
    role: "Roger",
    company: "Cain Park",
    credit: "Colleen Albrecht",
  },
  {
    src: "/images/gallery/rent-cain-park-6.jpg",
    width: 1200,
    height: 800,
    alt: "A wide view of the Rent stage in warm light, the silhouetted audience in the foreground",
    show: "Rent",
    role: "Roger",
    company: "Cain Park",
    credit: "Colleen Albrecht",
  },
  {
    src: "/images/gallery/rent-cain-park-7.jpg",
    width: 1200,
    height: 800,
    alt: "The company of Rent spread across the blue scaffolding set",
    show: "Rent",
    role: "Roger",
    company: "Cain Park",
    credit: "Colleen Albrecht",
  },

  // -------------------------------------------- Rock of Ages, Cain Park
  {
    src: "/images/gallery/rock-of-ages-1.jpg",
    width: 1800,
    height: 1449,
    alt: "Shane Lonergan as Drew on his knees centre stage, mid-number, the company arranged on the steps behind him",
    show: "Rock of Ages",
    role: "Drew",
    company: "Cain Park",
    credit: "Steve Wagner",
  },
  {
    src: "/images/gallery/rock-of-ages-2.jpg",
    width: 1200,
    height: 1800,
    alt: "Shane Lonergan as Drew singing in denim under stage spotlights, the company behind him",
    show: "Rock of Ages",
    role: "Drew",
    company: "Cain Park",
    credit: "Steve Wagner",
  },
  {
    src: "/images/gallery/rock-of-ages-3.jpg",
    width: 1800,
    height: 1727,
    alt: "Shane Lonergan as Drew kneeling beside another performer in blue light",
    show: "Rock of Ages",
    role: "Drew",
    company: "Cain Park",
    credit: "Steve Wagner",
  },

  // ------------------------------- Heathers: The Musical, Beck Center
  {
    src: "/images/gallery/heathers-1.jpg",
    width: 2400,
    height: 1600,
    alt: "Shane Lonergan as J.D. sitting on the floor beside Veronica against the colour-block set of Heathers",
    show: "Heathers: The Musical",
    role: "J.D.",
    company: "Beck Center for the Arts",
    credit: "Patrick Murphy",
  },
  {
    src: "/images/gallery/heathers-2.jpg",
    width: 1600,
    height: 2400,
    alt: "Shane Lonergan as J.D. in a long dark coat, drinking from a cup centre stage",
    show: "Heathers: The Musical",
    role: "J.D.",
    company: "Beck Center for the Arts",
    credit: "Patrick Murphy",
  },
  {
    src: "/images/gallery/heathers-3.jpg",
    width: 1599,
    height: 2400,
    alt: "Shane Lonergan as J.D. singing behind Veronica in blue light",
    show: "Heathers: The Musical",
    role: "J.D.",
    company: "Beck Center for the Arts",
    credit: "Patrick Murphy",
  },

  // ------------------------------------ Spring Awakening, Oberlin College
  {
    src: "/images/gallery/spring-awakening-1.jpg",
    width: 2400,
    height: 1600,
    alt: "Shane Lonergan as Melchior seated on a table opposite Wendla",
    show: "Spring Awakening",
    role: "Melchior",
    company: "Oberlin College",
    credit: "John Seyfried",
  },
  {
    src: "/images/gallery/spring-awakening-2.jpg",
    width: 1600,
    height: 2400,
    alt: "Shane Lonergan as Melchior standing above the seated boys, one arm raised",
    show: "Spring Awakening",
    role: "Melchior",
    company: "Oberlin College",
    credit: "John Seyfried",
  },
  {
    src: "/images/gallery/spring-awakening-3.jpg",
    width: 2400,
    height: 1600,
    alt: "Shane Lonergan as Melchior with his arms crossed over his chest, flanked by the company in blue light",
    show: "Spring Awakening",
    role: "Melchior",
    company: "Oberlin College",
    credit: "John Seyfried",
  },
  {
    src: "/images/gallery/spring-awakening-4.jpg",
    width: 2400,
    height: 1600,
    alt: "A wide view of the Spring Awakening stage, the company spread across its painted floor",
    show: "Spring Awakening",
    role: "Melchior",
    company: "Oberlin College",
    credit: "John Seyfried",
  },
];
