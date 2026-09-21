import type { Metadata } from "next";
import { ReelMusic } from "@/components/sections/ReelMusic";

export const metadata: Metadata = {
  title: "Reel & Music",
  description: "Acting reel and music from Shane Lonergan.",
};

/**
 * Standalone route for direct linking — an agent can send someone straight
 * here. Renders the same component the home page stacks, so the two can
 * never drift apart.
 */
export default function Page() {
  return <ReelMusic />;
}
