import type { Metadata } from "next";
import { NowPlaying } from "@/components/sections/NowPlaying";

export const metadata: Metadata = {
  title: "Now Playing",
  description: "Current and upcoming productions featuring Shane Lonergan.",
};

/**
 * Standalone route for direct linking — an agent can send someone straight
 * here. Renders the same component the home page stacks, so the two can
 * never drift apart.
 */
export default function Page() {
  return <NowPlaying />;
}
