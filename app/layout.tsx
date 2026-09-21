import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { SiteNav } from "@/components/SiteNav";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

/**
 * One typeface, everywhere. Bricolage Grotesque has a real optical-size
 * (opsz) axis: pronounced, notched grotesque character at display sizes,
 * which calms into an ordinary, legible grotesque at body text sizes. That's
 * what lets Shane's name at 120px and a photo credit at 11px share one
 * family without the site feeling like it's using two typefaces.
 */
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shane Lonergan",
  description: "Shane Lonergan — actor, director, and musician based in New York.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} h-full`}>
      <body className="min-h-full bg-bg text-fg">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteNav />
        <SmoothScroll />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
