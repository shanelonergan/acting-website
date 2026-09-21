import { memo } from "react";
import { channelLine, type PlacedLetter } from "@/lib/bulb-font";

/**
 * One word spelled in marquee bulbs: static yellow bulbs, each letter traced
 * by a single thin line in the same yellow, bulbs and line sharing one faint
 * glow. Geometry comes from lib/bulb-font.ts.
 *
 * Decorative only — the hero renders the real name as text elsewhere — so
 * the SVG is hidden from assistive tech.
 */

const BULB = "#ffd04a";
const PITCH = 12.5;
const R = PITCH * 0.26;
const HALO = { r: R * 2.1, opacity: 0.14 };

/** Width of the invisible letter body the line traces around the bulbs. */
const BODY = 21;
/** The traced line, and how far its glow spreads either side. */
const LINE = 1.8;
const GLOW = 4;

/**
 * Everything drawn sits within this distance of a letter's skeleton, and the
 * viewBox is the skeleton plus PAD on every side: 132.6 units tall, with the
 * traced line's outer edge 4 units in from each side. Callers sizing the SVG
 * work from those numbers (see Reveal.tsx).
 */
const PAD = BODY / 2 + LINE + GLOW;

type Placed = PlacedLetter & { dx: number };

// Layout is pure and depends only on the word, so work it out once.
const layouts = new Map<string, { letters: Placed[]; width: number }>();
function layoutFor(word: string) {
  let layout = layouts.get(word);
  if (!layout) {
    const { letters, width } = channelLine(word, { pitch: PITCH, gap: 34, wordGap: 72, body: BODY });
    layout = { letters: letters.map((l) => ({ ...l, dx: l.x })), width };
    layouts.set(word, layout);
  }
  return layout;
}

/**
 * Every stroke at one width. A stroke marked `clip` is trimmed to its
 * letter's box (or just its top and bottom), grown by the same half-width as
 * the square-ended stems, so it lines up with their ends at every width.
 */
function Strokes({ id, letters, width }: { id: string; letters: Placed[]; width: number }) {
  return (
    <>
      {letters.map((l, i) => (
        <g key={i} transform={`translate(${l.dx} 0)`}>
          {l.strokes.map((s, j) => {
            const clipId = `${id}-${i}-${j}`;
            return (
              <g key={j}>
                {s.clip && (
                  <clipPath id={clipId}>
                    {s.clip === "box" ? (
                      <rect x={-width / 2} y={-width / 2} width={l.w + width} height={100 + width} />
                    ) : (
                      <rect x={-500} y={-width / 2} width={1000} height={100 + width} />
                    )}
                  </clipPath>
                )}
                <path
                  d={s.d}
                  fill="none"
                  strokeWidth={width}
                  strokeLinecap={s.cap}
                  strokeLinejoin="round"
                  clipPath={s.clip ? `url(#${clipId})` : undefined}
                />
              </g>
            );
          })}
        </g>
      ))}
    </>
  );
}

/**
 * The traced line is a mask: every stroke painted wide in white, then again
 * at the body width in black. What survives is a line exactly LINE wide
 * around the outside of each letter, with nothing drawn across the inside
 * where strokes meet. The glow is the same trick, wider.
 *
 * `id` must be unique on the page; it namespaces the masks and clip paths.
 */
export const BulbWord = memo(function BulbWord({
  id,
  word,
  className,
}: {
  id: string;
  word: string;
  className?: string;
}) {
  const { letters, width } = layoutFor(word);
  const box = { x: -PAD, y: -PAD, width: width + PAD * 2, height: 100 + PAD * 2 };

  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <mask id={`${id}-line`} maskUnits="userSpaceOnUse" {...box}>
          <g stroke="white">
            <Strokes id={`${id}-lw`} letters={letters} width={BODY + LINE * 2} />
          </g>
          <g stroke="black">
            <Strokes id={`${id}-lb`} letters={letters} width={BODY} />
          </g>
        </mask>
        <mask id={`${id}-glow`} maskUnits="userSpaceOnUse" {...box}>
          <g stroke="white">
            <Strokes id={`${id}-gw`} letters={letters} width={BODY + (LINE + GLOW) * 2} />
          </g>
          <g stroke="black">
            <Strokes id={`${id}-gb`} letters={letters} width={BODY - GLOW * 2} />
          </g>
        </mask>
      </defs>
      <rect {...box} fill={BULB} opacity={HALO.opacity} mask={`url(#${id}-glow)`} />
      <rect {...box} fill={BULB} mask={`url(#${id}-line)`} />
      {letters.map((l, i) => (
        <g key={i} transform={`translate(${l.dx} 0)`}>
          {l.bulbs.map(([x, y], j) => (
            <circle key={`h${j}`} cx={x} cy={y} r={HALO.r} fill={BULB} opacity={HALO.opacity} />
          ))}
          {l.bulbs.map(([x, y], j) => (
            <circle key={j} cx={x} cy={y} r={R} fill={BULB} />
          ))}
        </g>
      ))}
    </svg>
  );
});
