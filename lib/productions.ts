import type { Production, ProductionCategory } from "@/content/productions";

export type RunStatus = "now-playing" | "upcoming" | "past" | "undated";

/**
 * Dates in the content file are plain calendar dates ("2026-06-28") with no
 * timezone. Parsing them with `new Date("2026-06-28")` would read them as
 * UTC midnight and shift a day backwards for anyone west of Greenwich —
 * which, for a New York actor, is everyone who matters. So compare them as
 * calendar days instead, never as instants.
 */
function toDayNumber(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return y * 10000 + m * 100 + d;
}

function todayDayNumber(now: Date): number {
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

/** A run is "now playing" through the whole of its closing day, not up to its start. */
export function statusOf(production: Production, now: Date = new Date()): RunStatus {
  const { startDate, endDate } = production;
  if (!startDate && !endDate) return "undated";

  const today = todayDayNumber(now);
  const start = startDate ? toDayNumber(startDate) : undefined;
  const end = endDate ? toDayNumber(endDate) : start;

  if (start !== undefined && today < start) return "upcoming";
  if (end !== undefined && today > end) return "past";
  return "now-playing";
}

/** Most recent first — for the "Recently" list and the resume. */
function byDateDescending(a: Production, b: Production): number {
  const aKey = a.endDate ?? a.startDate ?? "";
  const bKey = b.endDate ?? b.startDate ?? "";
  return bKey.localeCompare(aKey);
}

/** Soonest first — for what's coming up. */
function byDateAscending(a: Production, b: Production): number {
  const aKey = a.startDate ?? a.endDate ?? "";
  const bKey = b.startDate ?? b.endDate ?? "";
  return aKey.localeCompare(bKey);
}

export type NowPlayingGroups = {
  nowPlaying: Production[];
  upcoming: Production[];
  recent: Production[];
};

/**
 * Splits the catalogue for the Now Playing section. When nothing is running
 * and nothing is announced, the section still has "Recently" to show, so it
 * never renders empty — see the brief.
 */
export function groupByRun(
  all: Production[],
  now: Date = new Date(),
  recentLimit = 3,
): NowPlayingGroups {
  const nowPlaying: Production[] = [];
  const upcoming: Production[] = [];
  const recent: Production[] = [];

  for (const p of all) {
    switch (statusOf(p, now)) {
      case "now-playing":
        nowPlaying.push(p);
        break;
      case "upcoming":
        upcoming.push(p);
        break;
      case "past":
        recent.push(p);
        break;
      // Undated entries (a credit with no run dates) belong on the resume,
      // not in a time-ordered list.
      case "undated":
        break;
    }
  }

  // With no dates anywhere the section would have nothing to show, and the
  // brief asks that it never look empty. The array is maintained
  // most-recent-first, so the top of it is the best available answer to
  // "what has Shane been doing lately" — unless credits have been
  // hand-picked with `recentOrder`, which wins (and isn't capped, since
  // every pick was deliberate).
  if (nowPlaying.length === 0 && upcoming.length === 0 && recent.length === 0) {
    const picked = all
      .filter((p) => p.recentOrder !== undefined)
      .sort((a, b) => a.recentOrder! - b.recentOrder!);
    return {
      nowPlaying: [],
      upcoming: [],
      recent: picked.length > 0 ? picked : all.slice(0, recentLimit),
    };
  }

  return {
    nowPlaying: nowPlaying.sort(byDateAscending),
    upcoming: upcoming.sort(byDateAscending),
    recent: recent.sort(byDateDescending).slice(0, recentLimit),
  };
}

const CATEGORY_LABELS: Record<ProductionCategory, string> = {
  theatre: "Theatre",
  concert: "Workshops & Concerts",
  directing: "Directing",
  "film-tv": "Film & Television",
};

/** Resume order: the categories Shane leads with come first. */
const CATEGORY_ORDER: ProductionCategory[] = ["theatre", "directing", "concert", "film-tv"];

export type CreditGroup = { category: ProductionCategory; label: string; items: Production[] };

/** Groups credits for the resume, dropping any category with nothing in it. */
export function groupByCategory(all: Production[]): CreditGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: all.filter((p) => p.category === category).sort(byDateDescending),
  })).filter((group) => group.items.length > 0);
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * "June 6–28, 2026" / "June 28, 2026" / "April 30, 2026 – May 2, 2026".
 * Collapses the common case where a run sits inside one month and year.
 */
export function formatRun(production: Production): string | null {
  const { startDate, endDate } = production;
  if (!startDate && !endDate) return null;

  const start = startDate ?? endDate!;
  const end = endDate ?? startDate!;
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);

  if (start === end) return `${MONTHS[sm - 1]} ${sd}, ${sy}`;
  if (sy === ey && sm === em) return `${MONTHS[sm - 1]} ${sd}–${ed}, ${sy}`;
  if (sy === ey) return `${MONTHS[sm - 1]} ${sd} – ${MONTHS[em - 1]} ${ed}, ${sy}`;
  return `${MONTHS[sm - 1]} ${sd}, ${sy} – ${MONTHS[em - 1]} ${ed}, ${ey}`;
}

/**
 * A stable React key. Title alone isn't unique — Shane has played Jesus
 * Christ Superstar at three companies — and neither is title plus date,
 * since most credits carry no dates.
 */
export function productionKey(production: Production): string {
  return [production.title, production.company, production.role, production.startDate ?? ""].join("|");
}

/** The resume shows years, not full runs. */
export function formatYear(production: Production): string | null {
  const date = production.endDate ?? production.startDate;
  return date ? date.slice(0, 4) : null;
}
