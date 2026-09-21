import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Silences a stray package-lock.json Turbopack finds further up the
  // filesystem (outside this git repo) that it would otherwise mistake for
  // the workspace root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
