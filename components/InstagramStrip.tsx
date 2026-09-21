"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useEnterOnView } from "@/lib/use-enter-on-view";
import { site } from "@/content/site";
import type { Feed, FeedPost } from "@/lib/instagram";

/** Served by netlify/functions/instagram-feed.mts. */
const FEED_URL = "/instagram/feed.json";
/** Served by netlify/functions/instagram-image.mts, one image per post id. */
const imageUrl = (id: string) => `/instagram/image/${id}`;

const handle = site.socials.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");

/**
 * A quiet row of recent Instagram posts, linking out.
 *
 * Renders nothing at all until the feed has something in it — including
 * before Instagram is configured, during local development where the
 * Netlify functions aren't running, and if the request fails. The section
 * should never appear as an empty shell.
 *
 * Fetched on the client rather than at build time so new posts appear
 * without a redeploy. It sits near the bottom of the page, so it is not the
 * LCP element and its arrival shifts nothing above it.
 */
export function InstagramStrip() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const ref = useRef<HTMLElement>(null);
  useEnterOnView(ref);

  useEffect(() => {
    const controller = new AbortController();
    fetch(FEED_URL, { signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<Feed>) : null))
      .then((feed) => {
        if (feed?.posts?.length) setPosts(feed.posts);
      })
      .catch(() => {
        // Offline, blocked, or not configured — the strip simply stays away.
      });
    return () => controller.abort();
  }, []);

  if (posts.length === 0) return null;

  return (
    <section
      ref={ref}
      aria-labelledby="instagram-heading"
      className="enter px-6 pt-4 pb-24 sm:px-10 md:pb-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="instagram-heading" className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">
            Instagram
          </h2>
          <a
            href={site.socials.instagram}
            className="text-[13px] text-fg-muted transition-colors hover:text-accent"
          >
            @{handle}
          </a>
        </div>

        <ul className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
          {posts.map((post) => (
            <li key={post.id}>
              <a
                href={post.permalink}
                className="group relative block aspect-square overflow-hidden bg-black"
                aria-label={post.alt}
              >
                <Image
                  src={imageUrl(post.id)}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 33vw, 12rem"
                  className="object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
