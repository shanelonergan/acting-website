/**
 * Crops the site icons out of Shane's headshot and writes them into app/:
 *
 *   app/favicon.ico     tab icon: 16, 32 and 48px, cut to a circle
 *   app/apple-icon.png  180px home-screen icon, square (iOS rounds it)
 *
 * Headshot 1, cropped to the whole head. It's the moodier of the two, and
 * at 16px it's darker and softer than headshot 2 would be — Shane's pick,
 * made after seeing both. Tighter crops lose the hair; looser ones shrink
 * the face below what 16px can show.
 *
 * Each size is drawn straight from the full-resolution photo rather than
 * shrunk from a larger icon, which keeps the small ones sharper.
 *
 * Run after changing the photo or the crop: `node scripts/make-favicon.mts`
 * (Node 24; needs rsvg-convert, from `brew install librsvg`).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const PHOTO = {
  file: "public/images/headshots/headshot-1.jpg",
  width: 1920,
  height: 2401,
};

/** The square cut from the photo, in its pixels. */
const CROP = { x: 0, y: 150, size: 1700 };

function iconSvg({ circle }: { circle: boolean }): string {
  const photo = readFileSync(path.join(ROOT, PHOTO.file)).toString("base64");
  const { x, y, size } = CROP;
  const clip = circle
    ? `<clipPath id="c"><circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}"/></clipPath>`
    : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${size} ${size}">`,
    clip,
    `<image width="${PHOTO.width}" height="${PHOTO.height}"${circle ? ` clip-path="url(#c)"` : ""} href="data:image/jpeg;base64,${photo}"/>`,
    `</svg>`,
  ].join("");
}

function png(svg: string, size: number): Buffer {
  const dir = mkdtempSync(path.join(tmpdir(), "favicon-"));
  const src = path.join(dir, "icon.svg");
  writeFileSync(src, svg);
  execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), "-o", path.join(dir, "icon.png"), src]);
  return readFileSync(path.join(dir, "icon.png"));
}

/** An .ico holding PNG images, which every current browser reads. */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e); // width
    header.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    header.writeUInt8(0, e + 2); // palette colours
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

const tab = iconSvg({ circle: true });
writeFileSync(
  path.join(ROOT, "app/favicon.ico"),
  ico([16, 32, 48].map((size) => ({ size, data: png(tab, size) }))),
);
writeFileSync(path.join(ROOT, "app/apple-icon.png"), png(iconSvg({ circle: false }), 180));
console.log("Wrote app/favicon.ico (16/32/48) and app/apple-icon.png (180)");
