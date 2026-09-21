#!/usr/bin/env node
/**
 * Exports production photos at web size and prints ready-to-paste
 * content/gallery.ts entries.
 *
 *   npm run gallery:add -- <slug> <source.jpg> [more.jpg ...]
 *
 * Originals are never modified. Exports land in public/images/gallery as
 * <slug>-1.jpg, <slug>-2.jpg, … at most 2400px on the long edge — enough for
 * the gallery's widest slot on a retina screen — and are never upscaled, so a
 * small original stays its own size.
 *
 * Resizing goes through scripts/upright-resize.swift rather than sips so that
 * EXIF rotation is baked into the pixels; see the comment in that file for
 * why that matters to the layout.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const MAX_LONG_EDGE = 2400;
const QUALITY = 0.85;

const [slug, ...sources] = process.argv.slice(2);
if (!slug || sources.length === 0) {
  console.error("usage: npm run gallery:add -- <slug> <source.jpg> [...]");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "public/images/gallery");
const resizer = path.join(process.cwd(), "scripts/upright-resize.swift");
mkdirSync(outDir, { recursive: true });

let n = 0;
for (const source of sources) {
  if (!existsSync(source)) {
    console.error(`missing: ${source}`);
    process.exit(1);
  }
  n += 1;
  const name = `${slug}-${n}.jpg`;
  const dest = path.join(outDir, name);
  const size = execFileSync(
    "swift",
    [resizer, dest, String(MAX_LONG_EDGE), String(QUALITY), source],
    { encoding: "utf8" },
  ).trim();
  const [width, height] = size.split("x").map(Number);
  console.log(`  {
    src: "/images/gallery/${name}",
    width: ${width},
    height: ${height},
    alt: "TODO describe the photograph",
    show: "TODO",
    role: "TODO",
    company: "TODO",
    credit: "TODO",
  },`);
}
console.error(`\nexported ${n} file(s) to public/images/gallery/`);
