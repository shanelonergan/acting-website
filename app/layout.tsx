import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { HomeLink } from "@/components/HomeLink";
import { SiteNav } from "@/components/SiteNav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/content/site";
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

/**
 * Pages set only a `title`; the template adds the name ("Resume · Shane
 * Lonergan"). The link-preview image is app/opengraph-image.jpg, which
 * applies to every route. og:title and og:description are left unset on
 * purpose: previews then fall back to each page's own title and description,
 * where a value set here would label every page the same.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: "Shane Lonergan — actor, director, and musician based in New York.",
  openGraph: { type: "website", siteName: site.name, locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} h-full`}>
      <body className="min-h-full bg-bg text-fg">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <HomeLink />
        <SiteNav />
        <SmoothScroll />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
