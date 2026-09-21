import type { Metadata } from "next";
import { Gallery } from "@/components/sections/Gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Production photography featuring Shane Lonergan.",
};

/**
 * Standalone route for direct linking — an agent can send someone straight
 * here. Renders the same component the home page stacks, so the two can
 * never drift apart.
 */
export default function Page() {
  return <Gallery />;
}
