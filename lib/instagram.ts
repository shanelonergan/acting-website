/**
 * Recent Instagram posts, via a Behold (behold.so) JSON feed.
 *
 * Behold holds the Instagram connection and token, and serves resized copies
 * of each image from its own CDN, so there is nothing here to rotate or
 * re-host. The feed URL comes from the BEHOLD_FEED_URL environment variable;
 * without it the strip simply renders nothing (e.g. in local development).
 *
 * Server-only: the free plan allows 1,200 feed requests a month and pauses
 * the account past that, so the feed is fetched here and cached, never from
 * the browser. See REVALIDATE_SECONDS.
 */

/**
 * How long a fetched feed is reused before the next request refreshes it in
 * the background (ISR). Every refresh is one Behold "view": six hours is at
 * most ~120 a month, plus one per deploy. Behold's free plan only updates
 * the feed once a day anyway.
 */
const REVALIDATE_SECONDS = 6 * 60 * 60;

/** The free plan's cap; the strip's grid is laid out for exactly this many. */
export const POST_COUNT = 6;

type BeholdSize = { mediaUrl: string; width: number; height: number };

type BeholdMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

/** The subset of Behold's post fields this site reads. */
type BeholdPost = {
  id: string;
  permalink: string;
  timestamp: string;
  mediaType: BeholdMediaType;
  /** For videos this is the video file itself, never an image. */
  mediaUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
  /** Instagram's own alt text, when the post has one. */
  altText?: string;
  sizes?: Partial<Record<"small" | "medium" | "large" | "full", BeholdSize>>;
  children?: Array<{ mediaType: BeholdMediaType; mediaUrl?: string }>;
};

/** What the strip renders. */
export type FeedPost = {
  id: string;
  permalink: string;
  alt: string;
  src: string;
  /** Behold's resized copies, when present; empty means `src` is all there is. */
  srcSet: string;
};

/**
 * Behold's pre-sized images (400, 700, 1000px). The strip's tiles are never
 * wider than ~18rem, so `full` (2000px) is never worth sending.
 */
function srcSetFor(post: BeholdPost): string {
  return (["small", "medium", "large"] as const)
    .map((key) => post.sizes?.[key])
    .filter((size): size is BeholdSize => Boolean(size?.mediaUrl))
    .map((size) => `${size.mediaUrl} ${size.width}w`)
    .join(", ");
}

/**
 * A still image for the post, or null if it has none. A video's `mediaUrl`
 * is an MP4, so videos fall back to their thumbnail; a carousel falls back
 * to its first child that is an image.
 */
function fallbackImageFor(post: BeholdPost): string | null {
  if (post.mediaType === "VIDEO") return post.thumbnailUrl ?? null;
  if (post.mediaType === "CAROUSEL_ALBUM") {
    const firstImage = post.children?.find((child) => child.mediaType === "IMAGE" && child.mediaUrl);
    if (firstImage?.mediaUrl) return firstImage.mediaUrl;
  }
  return post.mediaUrl ?? post.thumbnailUrl ?? null;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Alt text from the caption: the first line, with hashtags, @mentions and
 * URLs removed, since a wall of tags read aloud is worse than nothing. Falls
 * back to the month and year, which at least locates the post in time.
 */
export function altTextFor(
  post: Pick<BeholdPost, "caption" | "timestamp">,
  maxLength = 120,
): string {
  const firstLine = (post.caption ?? "").split("\n")[0] ?? "";
  const cleaned = firstLine
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#@][\p{L}\p{N}_.]+/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s·,–—-]+$/u, "");

  if (cleaned.length > 0) {
    if (cleaned.length <= maxLength) return cleaned;
    const clipped = cleaned.slice(0, maxLength);
    const lastSpace = clipped.lastIndexOf(" ");
    // Break on a word boundary, unless that would throw away most of the
    // text — the threshold has to scale with maxLength, not be a fixed count.
    const breakPoint = lastSpace > maxLength * 0.6 ? lastSpace : clipped.length;
    return `${clipped.slice(0, breakPoint).trimEnd()}…`;
  }

  const date = new Date(post.timestamp);
  if (Number.isNaN(date.getTime())) return "Instagram post";
  return `Instagram post from ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Turns Behold's posts into what the strip renders, dropping any without an image. */
export function toFeedPosts(posts: BeholdPost[], limit = POST_COUNT): FeedPost[] {
  const result: FeedPost[] = [];
  for (const post of posts) {
    if (result.length === limit) break;
    const srcSet = srcSetFor(post);
    const src = post.sizes?.medium?.mediaUrl ?? fallbackImageFor(post);
    if (!src) continue;
    result.push({
      id: post.id,
      permalink: post.permalink,
      alt: post.altText?.trim() || altTextFor(post),
      src,
      srcSet,
    });
  }
  return result;
}

/**
 * The latest posts, or an empty list if the feed isn't configured or can't
 * be reached — the strip should disappear, never break the home page.
 */
export async function getInstagramPosts(): Promise<FeedPost[]> {
  const url = process.env.BEHOLD_FEED_URL;
  if (!url) return [];

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      console.warn(`instagram: Behold feed returned ${res.status}`);
      return [];
    }
    const feed = (await res.json()) as { posts?: BeholdPost[] };
    return toFeedPosts(feed.posts ?? []);
  } catch (error) {
    console.warn("instagram: could not fetch the Behold feed", error);
    return [];
  }
}
