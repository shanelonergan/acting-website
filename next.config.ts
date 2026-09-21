import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Silences a stray package-lock.json Turbopack finds further up the
  // filesystem (outside this git repo) that it would otherwise mistake for
  // the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Next 16 serves only listed qualities and quietly rounds anything else
    // to the nearest one. 75 is the default; 82 is the hero photo's (see
    // Reveal.tsx), which would otherwise go out at 75.
    qualities: [75, 82],
  },
  // Pages from the old Squarespace site that people or search engines may
  // still have. /gallery and /contact kept their paths; the rest of that
  // site's pages were template leftovers and can 404.
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/media", destination: "/reel", permanent: true },
      { source: "/news", destination: "/now-playing", permanent: true },
      // Temporary (307), not permanent: About is only cut for now (see
      // README), and a permanent redirect would stay cached in browsers
      // after it comes back. Delete this line when it does.
      { source: "/about", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
