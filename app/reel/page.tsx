import type { Metadata } from "next";
import { Reel } from "@/components/sections/Reel";
import { Music } from "@/components/sections/Music";

export const metadata: Metadata = {
  title: "Reel & Music",
  description: "Acting reel and music from Shane Lonergan.",
};

/**
 * Standalone route for direct linking — an agent can send someone straight
 * here. Renders the same components the home page stacks, so the two can
 * never drift apart. On the home page Music sits further down, after the
 * gallery; here the two stay together.
 */
export default function Page() {
  return (
    <>
      <Reel />
      <Music />
    </>
  );
}
