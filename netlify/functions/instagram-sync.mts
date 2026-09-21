import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import {
  BLOB_STORE,
  FEED_KEY,
  TOKEN_KEY,
  TOKEN_REFRESHED_AT_KEY,
  displayImageUrl,
  imageKey,
  shouldRefreshToken,
  toFeedPosts,
  type Feed,
  type InstagramMedia,
} from "../../lib/instagram";

const POST_LIMIT = 8;
const FIELDS =
  "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,children{media_type,media_url,thumbnail_url}";

/**
 * Pulls the latest posts once a day and copies their images into Netlify
 * Blobs, so the site serves them from its own origin.
 *
 * Why copy the images rather than hot-link them: the URLs Instagram returns
 * are signed and expire after a few days. Linking them directly would leave
 * broken images for whoever happens to visit after they lapse.
 *
 * The access token is also rotated here. A refresh returns a *new* token
 * string that must be stored, so the token lives in Blobs after first run;
 * the environment variable is only the seed.
 */
export default async function syncInstagram() {
  const store = getStore(BLOB_STORE);

  let token = (await store.get(TOKEN_KEY, { type: "text" })) ?? process.env.INSTAGRAM_ACCESS_TOKEN ?? null;
  if (!token) {
    console.log("instagram-sync: no access token configured; nothing to do");
    return new Response(JSON.stringify({ skipped: "no token" }), {
      headers: { "content-type": "application/json" },
    });
  }

  // --- rotate the token -------------------------------------------------
  const refreshedAt = await store.get(TOKEN_REFRESHED_AT_KEY, { type: "text" });
  if (shouldRefreshToken(refreshedAt)) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
      );
      if (res.ok) {
        const body = (await res.json()) as { access_token?: string };
        if (body.access_token) {
          token = body.access_token;
          await store.set(TOKEN_KEY, token);
          await store.set(TOKEN_REFRESHED_AT_KEY, new Date().toISOString());
          console.log("instagram-sync: access token refreshed");
        }
      } else {
        // A token under 24h old can't be refreshed yet; that's fine, it still works.
        console.warn(`instagram-sync: token refresh returned ${res.status}; continuing with the current token`);
      }
    } catch (error) {
      console.warn("instagram-sync: token refresh failed; continuing with the current token", error);
    }
  }

  // --- fetch the posts --------------------------------------------------
  const mediaRes = await fetch(
    `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=25&access_token=${token}`,
  );
  if (!mediaRes.ok) {
    const detail = await mediaRes.text();
    console.error(`instagram-sync: media request failed (${mediaRes.status}): ${detail.slice(0, 300)}`);
    // Leave the previous feed in place rather than blanking the strip.
    return new Response(JSON.stringify({ error: "media request failed", status: mediaRes.status }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const { data = [] } = (await mediaRes.json()) as { data?: InstagramMedia[] };
  const posts = toFeedPosts(data, POST_LIMIT);

  // --- copy the images --------------------------------------------------
  const kept = new Set<string>();
  for (const post of posts) {
    const media = data.find((item) => item.id === post.id);
    const url = media ? displayImageUrl(media) : null;
    if (!url) continue;
    try {
      const imageRes = await fetch(url);
      if (!imageRes.ok) {
        console.warn(`instagram-sync: image ${post.id} returned ${imageRes.status}`);
        continue;
      }
      const bytes = await imageRes.arrayBuffer();
      await store.set(imageKey(post.id), bytes, {
        metadata: { contentType: imageRes.headers.get("content-type") ?? "image/jpeg" },
      });
      kept.add(imageKey(post.id));
    } catch (error) {
      console.warn(`instagram-sync: could not copy image ${post.id}`, error);
    }
  }

  const feed: Feed = { posts: posts.filter((p) => kept.has(imageKey(p.id))), updatedAt: new Date().toISOString() };
  await store.setJSON(FEED_KEY, feed);

  // --- drop images that have fallen out of the feed ----------------------
  const { blobs } = await store.list({ prefix: "img/" });
  let pruned = 0;
  for (const blob of blobs) {
    if (!kept.has(blob.key)) {
      await store.delete(blob.key);
      pruned += 1;
    }
  }

  console.log(`instagram-sync: ${feed.posts.length} posts stored, ${pruned} old images pruned`);
  return new Response(JSON.stringify({ posts: feed.posts.length, pruned }), {
    headers: { "content-type": "application/json" },
  });
}

export const config: Config = {
  schedule: "@daily",
};
