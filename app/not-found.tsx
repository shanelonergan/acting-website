import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
};

/** Black, one line of light, a link home. */
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden
          className="h-24 w-px"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,214,170,0), rgba(255,214,170,.95) 50%, rgba(255,214,170,0))",
            boxShadow: "0 0 14px 2px rgba(255,190,120,.35)",
          }}
        />
        <h1 className="mt-10 text-[clamp(20px,2.4vw,28px)] font-medium">This page isn&rsquo;t here</h1>
        <Link
          href="/"
          className="mt-6 border-b border-accent/40 pb-0.5 text-[15px] text-accent transition-colors hover:border-accent"
        >
          Back to the top
        </Link>
      </div>
    </div>
  );
}
