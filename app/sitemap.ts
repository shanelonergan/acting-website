import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** Every page, for search engines. Add a route here when one is added to app/. */
const ROUTES = ["", "/resume", "/reel", "/now-playing", "/gallery", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({ url: `${site.url}${path}` }));
}
