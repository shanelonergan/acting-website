"use client";

import { useState } from "react";

/**
 * Click-to-play facade. An embedded YouTube iframe pulls in a large amount
 * of script on page load whether or not anyone watches it, so until the
 * visitor actually asks for the reel we render only a poster and a button.
 *
 * The poster comes from YouTube's own thumbnail host rather than being
 * committed to the repo, so it stays correct if the reel is replaced.
 */
export function YouTubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className="group relative block aspect-video w-full cursor-pointer overflow-hidden bg-black"
    >
      {/* Plain <img>: this is a third-party host and the facade is replaced
          the moment it's clicked, so next/image buys nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/50 bg-bg/50 backdrop-blur transition-colors group-hover:border-accent">
          <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true" fill="currentColor">
            <path d="M17 8.27a2 2 0 0 1 0 3.46L3 19.8A2 2 0 0 1 0 18.06V1.94A2 2 0 0 1 3 .2z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
