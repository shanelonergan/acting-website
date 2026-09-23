/**
 * A single-stroke "bulb sign" alphabet: each letter is the centreline of its
 * strokes. That one skeleton drives both halves of a channel letter — the
 * letter body is the skeleton stroked thick, and the bulbs sit at even
 * intervals along it, the way marquee letters are built. Only the letters in
 * "Shane Lonergan" exist.
 *
 * Given a `body` width (see channelLine), three letters are refitted to it
 * as block letters: N's diagonal meets the stem tops exactly, A becomes
 * straight-legged with a flat top, and R's foot is cut flat on the baseline.
 * components/BulbWord.tsx always passes one.
 *
 * Units: a cap height of 100, y pointing down. Arc angles are degrees in
 * screen space (0 = right, 90 = down, 180 = left, 270 = up), and an arc runs
 * from a1 to a2 in whichever direction that implies.
 *
 * Pure maths — runs on the server, so the SVG ships prerendered.
 */

type Seg =
  | { t: "line"; x1: number; y1: number; x2: number; y2: number }
  | { t: "arc"; cx: number; cy: number; r: number; a1: number; a2: number };

const line = (x1: number, y1: number, x2: number, y2: number): Seg => ({ t: "line", x1, y1, x2, y2 });
const arc = (cx: number, cy: number, r: number, a1: number, a2: number): Seg => ({ t: "arc", cx, cy, r, a1, a2 });

/**
 * One geometric family: straight stems, and bowls that are true semicircles
 * (O, A, G share the same r=30 curve). Segments are listed so that connected
 * strokes run end-to-start, which lets each become one continuous path.
 */
const GLYPHS: Record<string, { w: number; segs: Seg[]; kernAfter?: number }> = {
  S: { w: 60, segs: [arc(30, 25, 25, 340, 90), arc(30, 75, 25, 270, 520)] },
  H: { w: 60, segs: [line(0, 0, 0, 100), line(60, 0, 60, 100), line(0, 50, 60, 50)] },
  A: {
    w: 60,
    segs: [line(0, 100, 0, 30), arc(30, 30, 30, 180, 360), line(60, 30, 60, 100), line(0, 62, 60, 62)],
  },
  N: { w: 60, segs: [line(0, 100, 0, 0), line(0, 0, 60, 100), line(60, 100, 60, 0)] },
  E: { w: 54, segs: [line(0, 0, 0, 100), line(0, 0, 54, 0), line(0, 50, 44, 50), line(0, 100, 54, 100)] },
  // L is open on the right, so the next letter tucks in closer.
  L: { w: 52, segs: [line(0, 0, 0, 100), line(0, 100, 52, 100)], kernAfter: -12 },
  O: {
    w: 60,
    segs: [arc(30, 30, 30, 180, 360), line(60, 30, 60, 70), arc(30, 70, 30, 0, 180), line(0, 70, 0, 30)],
  },
  // The leg starts inside the bowl's lower stroke, not at its corner, so its
  // square end is buried in the body instead of notching the counter.
  R: {
    w: 60,
    segs: [line(0, 0, 0, 100), line(0, 0, 33, 0), arc(33, 25, 25, 270, 450), line(33, 50, 0, 50), line(36, 56, 60, 100)],
  },
  G: {
    w: 60,
    segs: [arc(30, 30, 30, 320, 180), line(0, 30, 0, 70), arc(30, 70, 30, 180, 0), line(60, 70, 60, 55), line(60, 55, 36, 55)],
  },
};

function segLength(s: Seg): number {
  return s.t === "line"
    ? Math.hypot(s.x2 - s.x1, s.y2 - s.y1)
    : (Math.abs(s.a2 - s.a1) * Math.PI * s.r) / 180;
}

function pointOn(s: Seg, f: number): [number, number] {
  if (s.t === "line") return [s.x1 + (s.x2 - s.x1) * f, s.y1 + (s.y2 - s.y1) * f];
  const a = ((s.a1 + (s.a2 - s.a1) * f) * Math.PI) / 180;
  return [s.cx + s.r * Math.cos(a), s.cy + s.r * Math.sin(a)];
}

const near = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.01;
const f2 = (n: number) => Number(n.toFixed(2));

/** Unit direction of travel at the start (f=0) or end (f=1) of a segment. */
function directionAt(s: Seg, f: 0 | 1): [number, number] {
  if (s.t === "line") {
    const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
    return [(s.x2 - s.x1) / len, (s.y2 - s.y1) / len];
  }
  const a = ((f === 0 ? s.a1 : s.a2) * Math.PI) / 180;
  const sign = s.a2 > s.a1 ? 1 : -1;
  return [-Math.sin(a) * sign, Math.cos(a) * sign];
}

const isDiagonal = (s: Seg) => s.t === "line" && Math.abs(s.x2 - s.x1) > 0.01 && Math.abs(s.y2 - s.y1) > 0.01;

/**
 * The letter body as strokes. Segments that flow into each other (same point,
 * same direction — a bowl running into a stem) become one path so the curve
 * stays smooth. Anywhere else the strokes are drawn separately with square
 * ends, which is what gives the letters crisp block corners. A diagonal
 * whose ends both meet other strokes (N's) gets flat (butt) ends instead:
 * they land inside the stems, where a square end would poke out past the
 * corner. A diagonal with a free end (R's leg) keeps the square end so its
 * last bulb stays on the letter.
 */
export type Stroke = {
  d: string;
  cap: "square" | "butt";
  /**
   * Trim to the letter's own box ("box", see nDiagonal), or only to its top
   * and bottom ("y", see the R's leg) so the end is cut flat on the baseline.
   */
  clip?: "box" | "y";
};

function bodyStrokes(segs: Seg[]): Stroke[] {
  const strokes: Stroke[] = [];
  let d = "";
  let prev: Seg | null = null;
  let start: [number, number] | null = null;
  let diagonalOnly = true;
  let first: [number, number] | null = null;
  let last: [number, number] | null = null;

  // True if another segment of this letter starts or ends at `p`.
  const meetsAnother = (p: [number, number], self: Seg[]) =>
    segs.some((o) => !self.includes(o) && (near(pointOn(o, 0), p) || near(pointOn(o, 1), p)));
  let members: Seg[] = [];

  const flush = () => {
    const tucked = diagonalOnly && first && last && meetsAnother(first, members) && meetsAnother(last, members);
    if (d) strokes.push({ d, cap: tucked ? "butt" : "square" });
    d = "";
    diagonalOnly = true;
    members = [];
  };

  for (const seg of segs) {
    const from = pointOn(seg, 0);
    const to = pointOn(seg, 1);
    const flows =
      prev !== null &&
      near(pointOn(prev, 1), from) &&
      (() => {
        const [ax, ay] = directionAt(prev, 1);
        const [bx, by] = directionAt(seg, 0);
        return ax * bx + ay * by > 0.99;
      })();
    if (!flows) {
      flush();
      d = `M${f2(from[0])} ${f2(from[1])}`;
      start = from;
      first = from;
    }
    members.push(seg);
    last = to;
    if (seg.t === "line") {
      d += `L${f2(to[0])} ${f2(to[1])}`;
    } else {
      const sweep = seg.a2 > seg.a1 ? 1 : 0;
      const large = Math.abs(seg.a2 - seg.a1) > 180 ? 1 : 0;
      d += `A${seg.r} ${seg.r} 0 ${large} ${sweep} ${f2(to[0])} ${f2(to[1])}`;
    }
    if (!isDiagonal(seg)) diagonalOnly = false;
    if (start && near(to, start)) d += "Z";
    prev = seg;
  }
  flush();
  return strokes;
}

/**
 * Bulbs every ~`pitch` along each segment; corners always get one. A bulb
 * closer than `minGap` pitches to one already placed is dropped.
 *
 * Coordinates are rounded to hundredths: trig results can differ in the last
 * digits between Node and the browser, and the SVG is rendered on both, so
 * unrounded values would fail hydration.
 */
function bulbsFor(segs: Seg[], pitch: number, minGap = 0.55): [number, number][] {
  const out: [number, number][] = [];
  for (const seg of segs) {
    const n = Math.max(1, Math.round(segLength(seg) / pitch));
    for (let i = 0; i <= n; i++) {
      const [px, py] = pointOn(seg, i / n);
      const p: [number, number] = [f2(px), f2(py)];
      if (out.every(([ox, oy]) => Math.hypot(ox - p[0], oy - p[1]) > pitch * minGap)) out.push(p);
    }
  }
  return out;
}

export type PlacedLetter = { x: number; w: number; strokes: Stroke[]; bulbs: [number, number][] };

/**
 * N's diagonal, fitted to a letter body `body` wide. Its outer edges run
 * exactly into the top-left and bottom-right corners (the tops of the stems)
 * so the diagonal and the stem read as one clean corner, with no step where
 * they meet. The band is drawn long and trimmed to the letter's box, and the
 * bulbs follow its centreline, which passes through the letter's middle.
 */
function nDiagonal(w: number, body: number): { stroke: Stroke; bulbPath: Seg } {
  const h = body / 2;
  // One edge passes through the top of the left stem's inner corner, the
  // other through the bottom of the right stem's inner corner.
  const [ax, ay] = [h, -h];
  const [bx, by] = [w - h, 100 + h];
  const span = Math.hypot(bx - ax, by - ay);
  // Tilt the band off the corner-to-corner line just enough that the two
  // parallel edges sit exactly `body` apart.
  const angle = Math.atan2(by - ay, bx - ax) - Math.asin(body / span);
  const [dx, dy] = [Math.cos(angle), Math.sin(angle)];
  const [mx, my] = [(ax + bx) / 2, (ay + by) / 2];
  const at = (y: number): [number, number] => [mx + ((y - my) / dy) * dx, y];
  const [x0, y0] = at(-100);
  const [x1, y1] = at(200);
  const [bx0] = at(0);
  const [bx1] = at(100);
  return {
    stroke: { d: `M${f2(x0)} ${f2(y0)}L${f2(x1)} ${f2(y1)}`, cap: "butt", clip: "box" },
    bulbPath: line(bx0, 0, bx1, 100),
  };
}

/**
 * Lays out one line of channel letters. `gap` is between skeletons, so it
 * has to clear the stroke width for the letter bodies not to touch. Pass
 * `body` (the letter body's width) to fit N's diagonal to it exactly.
 */
export function channelLine(
  text: string,
  { pitch = 20, gap = 34, wordGap = 80, body }: { pitch?: number; gap?: number; wordGap?: number; body?: number } = {},
): { letters: PlacedLetter[]; width: number } {
  const letters: PlacedLetter[] = [];
  let x = 0;
  let right = 0;
  for (const ch of text.toUpperCase()) {
    if (ch === " ") {
      x += wordGap - gap;
      continue;
    }
    const glyph = GLYPHS[ch];
    if (!glyph) throw new Error(`bulb-font: no glyph for "${ch}"`);
    if (ch === "N" && body) {
      // Stems first, so where the diagonal's bulbs crowd a stem's, the
      // stem's bulb is the one kept.
      const stems = [glyph.segs[0], glyph.segs[2]];
      const diagonal = nDiagonal(glyph.w, body);
      letters.push({
        x,
        w: glyph.w,
        strokes: [...bodyStrokes(stems), diagonal.stroke],
        bulbs: bulbsFor([...stems, diagonal.bulbPath], pitch),
      });
    } else if (ch === "A" && body) {
      // A block A: two straight legs, cut flat at the cap height and on the
      // baseline, like the stems. The legs start 16 apart at the top rather
      // than meeting in a point, which gives a short flat apex and keeps the
      // top bulbs from crowding. Legs run long and are trimmed top and bottom.
      const legs: [number, number, number, number][] = [
        [22, 0, 4, 100],
        [38, 0, 56, 100],
      ];
      const xAt = ([ax, ay, bx, by]: [number, number, number, number], y: number) => ax + ((y - ay) * (bx - ax)) / (by - ay);
      const barY = 62;
      const [barL, barR] = [xAt(legs[0], barY), xAt(legs[1], barY)];
      letters.push({
        x,
        w: glyph.w,
        strokes: [
          ...legs.map(
            (leg): Stroke => ({
              d: `M${f2(xAt(leg, -100))} -100L${f2(xAt(leg, 200))} 200`,
              cap: "butt",
              clip: "y",
            }),
          ),
          // Ends on the legs' centrelines, flat, so they stay inside the legs.
          { d: `M${f2(barL)} ${barY}L${f2(barR)} ${barY}`, cap: "butt" },
        ],
        bulbs: bulbsFor([...legs.map((l) => line(...l)), line(barL, barY, barR, barY)], pitch),
      });
    } else if (ch === "R" && body) {
      // The leg runs on past the baseline and is trimmed there, so its foot
      // is cut flat like every other letter's instead of square to the slant.
      const [x0, y0, x1, y1] = [36, 56, 56, 100];
      const reach = 140;
      const xAtReach = x0 + ((reach - y0) * (x1 - x0)) / (y1 - y0);
      const bowlAndStem = glyph.segs.slice(0, 4);
      letters.push({
        x,
        w: glyph.w,
        strokes: [
          ...bodyStrokes(bowlAndStem),
          { d: `M${x0} ${y0}L${f2(xAtReach)} ${reach}`, cap: "square", clip: "y" },
        ],
        bulbs: bulbsFor([...bowlAndStem, line(x0, y0, x1, y1)], pitch),
      });
    } else {
      letters.push({ x, w: glyph.w, strokes: bodyStrokes(glyph.segs), bulbs: bulbsFor(glyph.segs, pitch) });
    }
    right = x + glyph.w;
    x += glyph.w + gap + (glyph.kernAfter ?? 0);
  }
  return { letters, width: right };
}

/**
 * The hero's bulb-sign look: yellow bulbs with a faint halo, each letter
 * traced by one thin line in the same yellow with the same glow, as drawn by
 * components/BulbWord.tsx. Units are the alphabet's (cap height 100).
 */
export const BULB_SIGN = {
  color: "#ffd04a",
  pitch: 12.5,
  bulbR: 12.5 * 0.26,
  /** Halo radius as a multiple of the bulb's, and its opacity (shared by the line's glow). */
  halo: { scale: 2.1, opacity: 0.14 },
  /** Width of the invisible letter body the line traces around the bulbs. */
  body: 21,
  /** The traced line, and how far its glow spreads either side. */
  line: 1.8,
  glow: 4,
  gap: 34,
  wordGap: 72,
} as const;

/** Everything drawn sits within this distance of a letter's skeleton. */
export const BULB_SIGN_PAD = BULB_SIGN.body / 2 + BULB_SIGN.line + BULB_SIGN.glow;

/** A word laid out in the bulb-sign style. */
export function bulbSignLayout(word: string) {
  const { pitch, gap, wordGap, body } = BULB_SIGN;
  return channelLine(word, { pitch, gap, wordGap, body });
}
