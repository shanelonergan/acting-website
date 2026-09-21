import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Shane Lonergan and representation.",
};

/**
 * Standalone route for direct linking — an agent can send someone straight
 * here. Renders the same component the home page stacks, so the two can
 * never drift apart.
 */
export default function Page() {
  return <Contact />;
}
