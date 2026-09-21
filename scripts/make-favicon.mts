/**
 * Draws the site icons — an S in the hero's bulb-sign lettering, on the
 * page's near-black — and writes them into app/:
 *
 *   app/favicon.ico     tab icon: 16, 32 and 48px, each drawn for its size
 *   app/apple-icon.png  180px home-screen icon, square (iOS rounds it)
 *
 * Three weights of the same lettering. At tab size the hero's own weighting
 * blurs (its traced line comes out under a third of a pixel, its bulbs
 * about one), so 32/48px use fewer, bigger bulbs and a heavier line without
 * the glow, and 16px — too small for an outline to read at all — is the
 * bulbs alone. The 180px icon has room for the exact hero weighting. One
 * letter rather than both initials, because it can fill the tile at nearly
 * twice the size.
 *
 * Deliberately no SVG icon: browsers use an SVG at every size, which would
 * rule out drawing 16px differently. The .ico's per-size images are picked
 * by the browser to suit the screen.
 *
 * Run after changing the lettering: `node scripts/make-favicon.mts`
 * (Node 24; needs rsvg-convert, from `brew install librsvg`).
 *
 * The drawing mirrors components/BulbWord.tsx, and the look comes from
 * BULB_SIGN in lib/bulb-font.ts, so the icon and the hero can't drift.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { BULB_SIGN, channelLine, type PlacedLetter } from "../lib/bulb-font.ts";

const LETTER = "S";
const BACKGROUND = "#0a0908"; // --bg in app/globals.css
const ROOT = path.resolve(import.meta.dirname, "..");

/** How the lettering is weighted. Units are the alphabet's (cap height 100). */
type Weight = {
  pitch: number;
  bulbR: number;
  body: number;
  line: number;
  /** 0 for none (line and glow alike). */
  glow: number;
  /** Space between the traced outline and the tile's edge. */
  margin: number;
};

/** The hero's own weighting, from BULB_SIGN. */
const EXACT: Weight = {
  pitch: BULB_SIGN.pitch,
  bulbR: BULB_SIGN.bulbR,
  body: BULB_SIGN.body,
  line: BULB_SIGN.line,
  glow: BULB_SIGN.glow,
  margin: 22,
};

/** For 32–48px: about two-thirds as many bulbs, half again as big, and a line 2.5x heavier. */
const TAB: Weight = { pitch: 16.7, bulbR: 5, body: 24, line: 4.5, glow: 0, margin: 6 };

/** For 16px: the bulbs alone, bigger again. `line: 0` drops the outline. */
const TAB_SMALL: Weight = { pitch: 16.7, bulbR: 6.5, body: 21, line: 0, glow: 0, margin: 6 };

/** Every stroke at one width, with the same clipping as BulbWord's Strokes. */
function strokes(letters: PlacedLetter[], width: number, id: string): string {
  return letters
    .map((l, i) =>
      l.strokes
        .map((s, j) => {
          const clipId = `${id}-${i}-${j}`;
          const clip = s.clip
            ? `<clipPath id="${clipId}"><rect x="${s.clip === "box" ? -width / 2 : -500}" y="${-width / 2}" width="${
                s.clip === "box" ? l.w + width : 1000
              }" height="${100 + width}"/></clipPath>`
            : "";
          const clipAttr = s.clip ? ` clip-path="url(#${clipId})"` : "";
          return `<g transform="translate(${l.x} 0)">${clip}<path d="${s.d}" fill="none" stroke-width="${width}" stroke-linecap="${s.cap}" stroke-linejoin="round"${clipAttr}/></g>`;
        })
        .join(""),
    )
    .join("");
}

function iconSvg(w: Weight, { rounded }: { rounded: boolean }): string {
  const { pitch, bulbR, body, line, glow } = w;
  const { letters, width } = channelLine(LETTER, { pitch, gap: BULB_SIGN.gap, wordGap: BULB_SIGN.wordGap, body });
  const halo = { r: bulbR * BULB_SIGN.halo.scale, opacity: BULB_SIGN.halo.opacity };
  const color = BULB_SIGN.color;
  // A square tile around the traced outline (not the glow), centred.
  const outline = body / 2 + line;
  const TILE = Math.max(width, 100) + outline * 2 + w.margin * 2;
  const dx = (TILE - (width + outline * 2)) / 2 + outline;
  const dy = (TILE - (100 + outline * 2)) / 2 + outline;
  const box = `x="${-dx}" y="${-dy}" width="${TILE}" height="${TILE}"`;
  const bulbs = (r: number, extra = "") =>
    letters
      .map((l) => l.bulbs.map(([x, y]) => `<circle cx="${l.x + x}" cy="${y}" r="${r}" fill="${color}"${extra}/>`).join(""))
      .join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" width="${TILE}" height="${TILE}">`,
    `<rect width="${TILE}" height="${TILE}" rx="${rounded ? TILE * 0.2 : 0}" fill="${BACKGROUND}"/>`,
    `<g transform="translate(${dx} ${dy})">`,
    `<defs>`,
    line
      ? `<mask id="line" maskUnits="userSpaceOnUse" ${box}><g stroke="white">${strokes(letters, body + line * 2, "lw")}</g><g stroke="black">${strokes(letters, body, "lb")}</g></mask>`
      : "",
    glow
      ? `<mask id="glow" maskUnits="userSpaceOnUse" ${box}><g stroke="white">${strokes(letters, body + (line + glow) * 2, "gw")}</g><g stroke="black">${strokes(letters, body - glow * 2, "gb")}</g></mask>`
      : "",
    `</defs>`,
    glow ? `<rect ${box} fill="${color}" opacity="${halo.opacity}" mask="url(#glow)"/>` : "",
    line ? `<rect ${box} fill="${color}" mask="url(#line)"/>` : "",
    glow ? bulbs(halo.r, ` opacity="${halo.opacity}"`) : "",
    bulbs(bulbR),
    `</g>`,
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

const tab = iconSvg(TAB, { rounded: true });
writeFileSync(
  path.join(ROOT, "app/favicon.ico"),
  ico([
    { size: 16, data: png(iconSvg(TAB_SMALL, { rounded: true }), 16) },
    { size: 32, data: png(tab, 32) },
    { size: 48, data: png(tab, 48) },
  ]),
);
writeFileSync(path.join(ROOT, "app/apple-icon.png"), png(iconSvg(EXACT, { rounded: false }), 180));
console.log("Wrote app/favicon.ico (16/32/48) and app/apple-icon.png (180)");
