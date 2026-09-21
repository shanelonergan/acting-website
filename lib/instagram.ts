/**
 * Pure helpers for the Instagram integration — no network, no storage, so
 * they can be tested directly. The Netlify functions in netlify/functions
 * supply the I/O.
 */

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

/** The subset of Instagram's media fields this site asks for. */
export type InstagramMedia = {
  id: string;
  media_type: InstagramMediaType;
  media_url?: string;
  /** Videos expose a still here; media_url is the video file itself. */
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  children?: {
    data: Array<{
      media_type: InstagramMediaType;
      media_url?: string;
      thumbnail_url?: string;
    }>;
  };
};

/** What the site actually renders. Deliberately excludes anything private. */
export type FeedPost = {
  id: string;
  permalink: string;
  alt: string;
  timestamp: string;
};

export type Feed = {
  posts: FeedPost[];
  updatedAt: string;
};

/**
 * The still image to show for a post.
 *
 * Videos and reels have to use `thumbnail_url` — their `media_url` is an MP4.
 * A carousel's own `media_url` is its first item, which may itself be a video,
 * so prefer the first child that is a real image.
 */
export function displayImageUrl(media: InstagramMedia): string | null {
  if (media.media_type === "VIDEO") return media.thumbnail_url ?? null;

  if (media.media_type === "CAROUSEL_ALBUM") {
    const children = media.children?.data ?? [];
    const firstImage = children.find((child) => child.media_type === "IMAGE" && child.media_url);
    if (firstImage?.media_url) return firstImage.media_url;
    const firstThumb = children.find((child) => child.thumbnail_url);
    if (firstThumb?.thumbnail_url) return firstThumb.thumbnail_url;
  }

  return media.media_url ?? media.thumbnail_url ?? null;
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
export function altTextFor(media: InstagramMedia, maxLength = 120): string {
  const firstLine = (media.caption ?? "").split("\n")[0] ?? "";
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

  const date = new Date(media.timestamp);
  if (Number.isNaN(date.getTime())) return "Instagram post";
  return `Instagram post from ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Turns an API response into what gets stored and served. */
export function toFeedPosts(media: InstagramMedia[], limit: number): FeedPost[] {
  return media
    .filter((item) => displayImageUrl(item) !== null)
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      permalink: item.permalink,
      alt: altTextFor(item),
      timestamp: item.timestamp,
    }));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Long-lived tokens last 60 days and can only be refreshed once they're at
 * least 24 hours old. Refreshing weekly keeps a wide margin: the token would
 * have to go un-refreshed for over eight weeks to expire, and a refresh
 * returns a new token string that must be stored, so this never mutates in
 * place.
 */
export function shouldRefreshToken(refreshedAt: string | null, now: Date = new Date()): boolean {
  if (!refreshedAt) return true;
  const last = new Date(refreshedAt);
  if (Number.isNaN(last.getTime())) return true;
  return now.getTime() - last.getTime() >= 7 * DAY_MS;
}

/** Blob keys, in one place so the sync and serving functions can't drift. */
export const BLOB_STORE = "instagram";
export const FEED_KEY = "feed";
export const TOKEN_KEY = "token";
export const TOKEN_REFRESHED_AT_KEY = "token-refreshed-at";
export const imageKey = (id: string) => `img/${id}`;
