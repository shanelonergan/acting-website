import type { Metadata } from "next";
import { Resume } from "@/components/sections/Resume";

export const metadata: Metadata = {
  title: "Resume",
  description: "Theatre, concert, and directing credits, training, and headshots for Shane Lonergan.",
};

/**
 * Standalone route for direct linking — an agent can send someone straight
 * here. Renders the same component the home page stacks, so the two can
 * never drift apart.
 */
export default function Page() {
  return <Resume />;
}
