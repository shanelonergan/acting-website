import Link from "next/link";

/**
 * Always mounted, above the hero's pin. This is the casting-director fast
 * path: Resume, Headshots, Reel, and Contact are one tap away from anywhere,
 * regardless of scroll position or whether the reveal has played.
 *
 * Kept visually quiet (fg-muted at ~68% opacity, ~8.3:1 contrast against the
 * near-black background — verified against the design plan's token
 * contrast pass) but never below AA, per the brief.
 */
export function SiteNav() {
  return (
    <nav
      aria-label="Quick links"
      className="fixed top-4 right-4 z-40 flex gap-4 text-[13px] tracking-[0.06em] sm:top-5 sm:right-6 sm:gap-5"
    >
      <Link href="/resume" className="text-fg-muted transition-colors hover:text-accent">
        Resume
      </Link>
      {/* Headshots live on the Resume page (see brief: downloads sit alongside credits). */}
      <Link href="/resume#headshots" className="text-fg-muted transition-colors hover:text-accent">
        Headshots
      </Link>
      <Link href="/reel" className="text-fg-muted transition-colors hover:text-accent">
        Reel
      </Link>
      <Link href="/contact" className="text-fg-muted transition-colors hover:text-accent">
        Contact
      </Link>
    </nav>
  );
}
