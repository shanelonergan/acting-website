"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The way back to the home page from every other route, mirroring SiteNav
 * in the opposite corner.
 *
 * Hidden on the home page itself: the hero already carries the name, and
 * "Skip to the show" occupies this corner there. On phones the label is
 * "Home" — the full name doesn't fit beside SiteNav's four links.
 */
export function HomeLink() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Link
      href="/"
      className="fixed top-4 left-4 z-40 text-[13px] tracking-[0.06em] text-fg transition-colors hover:text-accent sm:top-5 sm:left-6"
    >
      <span className="sm:hidden">Home</span>
      <span className="hidden sm:inline">Shane Lonergan</span>
    </Link>
  );
}
