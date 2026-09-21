import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { BLOB_STORE, FEED_KEY, type Feed } from "../../lib/instagram";

const EMPTY: Feed = { posts: [], updatedAt: new Date(0).toISOString() };

/**
 * Serves the stored feed. Public data only — permalinks, alt text and
 * timestamps; the access token never leaves the sync function.
 *
 * Returns an empty feed rather than an error when nothing has synced yet, so
 * the strip simply renders nothing until Instagram is configured.
 */
export default async function instagramFeed() {
  let feed: Feed = EMPTY;
  try {
    feed = ((await getStore(BLOB_STORE).get(FEED_KEY, { type: "json" })) as Feed | null) ?? EMPTY;
  } catch (error) {
    console.warn("instagram-feed: could not read the feed", error);
  }

  return new Response(JSON.stringify(feed), {
    headers: {
      "content-type": "application/json",
      // Browsers re-check quickly; Netlify's CDN holds it for an hour and
      // serves the stale copy while it revalidates, so a sync never causes a
      // visible gap.
      "cache-control": "public, max-age=300",
      "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export const config: Config = {
  path: "/instagram/feed.json",
};
