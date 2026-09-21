"use client";

import { useRef, useState } from "react";
import { getImageProps } from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useDebugMode } from "@/lib/use-debug-mode";
import { HERO_SCRUB_SECONDS } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Framing = "inset" | "full-bleed";

export type RevealMedia = {
  /** Full-frame image. A video variant slots in here later without touching layout. */
  type: "image";
  src: string;
  /** Optional purpose-made phone crop, art-directed via <picture> — see below. */
  mobileSrc?: string;
  mobileWidth?: number;
  mobileHeight?: number;
  width: number;
  height: number;
  alt: string;
  objectPosition: string;
  mobileObjectPosition?: string;
};

interface RevealProps {
  name: string;
  tagline: string;
  media: RevealMedia;
  credit?: string;
  framing: { mobile: Framing; desktop: Framing };
}

/**
 * Precomputed Tailwind class pairs for each framing combination. These must
 * stay as complete, literal strings — Tailwind's build-time scanner looks
 * for whole class names in the source text, so a class assembled by
 * concatenating "md:" with a variable at runtime is invisible to it and
 * never gets generated. This lookup is the one-line config surface the
 * brief asks for: change `framing` in content/site.ts, not this file.
 */
const FRAMING_CLASSES: Record<`${Framing}/${Framing}`, { wrapper: string; object: string }> = {
  "inset/inset": { wrapper: "inset-[4vmin] sm:inset-[6vmin]", object: "object-contain" },
  "inset/full-bleed": {
    wrapper: "inset-[4vmin] sm:inset-[6vmin] md:inset-0",
    object: "object-contain md:object-cover",
  },
  "full-bleed/inset": {
    wrapper: "inset-0 md:inset-[4vmin] md:sm:inset-[6vmin]",
    object: "object-cover md:object-contain",
  },
  "full-bleed/full-bleed": { wrapper: "inset-0", object: "object-cover" },
};

/** Splits "Shane Lonergan" into ["Shane", "Lonergan"] at the first space. */
function splitName(name: string): [string, string] {
  const i = name.indexOf(" ");
  return i === -1 ? [name, ""] : [name.slice(0, i), name.slice(i + 1)];
}

/** Every element the reveal animates, resolved from refs once they're mounted. */
type RevealEls = {
  stage: HTMLDivElement;
  media: HTMLDivElement;
  dark: HTMLDivElement;
  seam: HTMLDivElement;
  panelL: HTMLDivElement;
  panelR: HTMLDivElement;
  edgeL: HTMLDivElement;
  edgeR: HTMLDivElement;
  nameL: HTMLSpanElement;
  nameR: HTMLSpanElement;
  cue: HTMLDivElement;
  skip: HTMLAnchorElement;
  shade: HTMLDivElement;
  final: HTMLDivElement;
  credit: HTMLParagraphElement | null;
};

/** How far each name half travels, as a fraction of the stage width. */
const PANEL_WIDTH = 0.51;
const PANEL_TRAVEL = 0.78;

/**
 * The reveal's one canonical progress → visuals mapping. Positions and
 * durations are fractions of the timeline (0 → 1), which ScrollTrigger
 * scrubs against scroll position, so they read as the percentages in the
 * brief's timeline table.
 */
function buildTimeline(els: RevealEls) {
  // Deliberately NOT given a `scrollTrigger` here: passing an existing
  // ScrollTrigger instance through timeline vars makes GSAP build a second,
  // duplicate trigger from it. The caller attaches this timeline via
  // ScrollTrigger.create({ animation: tl }) instead, so exactly one trigger
  // owns it.
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  // 0–5%: the "Scroll" cue retracts almost immediately, and the "Skip to the
  // show" link goes with it — once you're scrolling, there's nothing left to
  // skip, and it would otherwise collide with the settled title card at the
  // end. autoAlpha (not opacity) so the hidden link also leaves the tab order.
  tl.to(els.cue, { opacity: 0, duration: 0.05 }, 0);
  tl.to(els.skip, { autoAlpha: 0, duration: 0.05 }, 0);

  // 3–18%: a hairline of light draws down the seam between the names.
  tl.to(els.seam, { scaleY: 1, duration: 0.15, ease: "power3.out" }, 0.03);
  // 20–34%: the seam fades, handing its light to the panels' inner edges.
  tl.to(els.seam, { opacity: 0, duration: 0.14 }, 0.2);

  // 15–65%: the halves part. Each panel is 51% wide, anchored at its OUTER
  // screen edge (transform-origin), so scaling it down in width pulls its
  // INNER edge back toward that anchor — that's what reads as the panel
  // "opening" toward the center. `sine.inOut` gives the slow start the brief
  // asks for ("as if there's mass behind it"); the scrub's own lag (see
  // lib/motion.ts) adds the rest of the weight.
  tl.to(
    [els.panelL, els.panelR],
    { scaleX: 1 - PANEL_TRAVEL, duration: 0.5, ease: "sine.inOut" },
    0.15,
  );
  // Each name rides its own panel's inner edge outward by exactly the
  // distance that edge retreats, so the gap between "Shane" and "Lonergan"
  // always matches the gap between the panels. Function-based values plus
  // invalidateOnRefresh keep this correct across viewport resizes.
  const travel = () => els.stage.clientWidth * PANEL_WIDTH * PANEL_TRAVEL;
  tl.to(els.nameL, { x: () => -travel(), duration: 0.5, ease: "sine.inOut" }, 0.15);
  tl.to(els.nameR, { x: () => travel(), duration: 0.5, ease: "sine.inOut" }, 0.15);

  // 15–30%, sustained through the reveal: the inner-edge glow rises, riding
  // the retreating panels rather than the seam.
  tl.to([els.edgeL, els.edgeR], { opacity: 0.55, duration: 0.15 }, 0.15);
  tl.to([els.edgeL, els.edgeR], { opacity: 1, duration: 0.5, ease: "power3.out" }, 0.35);

  // 65–88%: the panels finish travelling off the edges entirely, so the
  // reveal ends on the photograph alone with nothing framing it.
  //
  // This is a separate tween rather than a larger PANEL_TRAVEL because the
  // name halves are pinned to that constant — widening it would move them
  // further and invalidate the clipping margin derived below. By 65% the
  // names are long gone, so the panels are free to keep going alone.
  // Opacity goes with the scale: at scaleX(0) the panel is already
  // zero-width, and this guarantees no sub-pixel sliver survives.
  tl.to([els.panelL, els.panelR], { scaleX: 0, duration: 0.23, ease: "power2.inOut" }, 0.65);
  tl.to([els.panelL, els.panelR], { opacity: 0, duration: 0.18 }, 0.7);

  // 26–38%: the names fade out well before they could touch or clip an edge.
  //
  // The 38% end is geometry, not taste. Both the type size (6.4vw) and the
  // travel distance (39.8vw) scale with viewport width, so the ratio between
  // them is width-independent: the longer half ("Lonergan") still has ~55% of
  // its travel left when it reaches the screen edge, which happens at ~41.5%
  // progress. Finishing the fade at 38% keeps a margin under that at every
  // width the clamp() leaves in vw territory. If the type size or PANEL_TRAVEL
  // changes, re-derive this number — don't nudge it by eye.
  tl.to([els.nameL, els.nameR], { opacity: 0, duration: 0.12 }, 0.26);

  // 35–85%: the photograph resolves from black with a slow push-in.
  tl.to(els.dark, { opacity: 0, duration: 0.5, ease: "power3.out" }, 0.35);
  tl.to(els.media, { scale: 1, duration: 0.5, ease: "power3.out" }, 0.35);
  if (els.credit) {
    tl.to(els.credit, { opacity: 1, duration: 0.5, ease: "power3.out" }, 0.35);
  }

  // 80–97%: the name settles bottom-left as a film title card; the
  // legibility gradient arrives with it, not before.
  tl.to(els.shade, { opacity: 1, duration: 0.17 }, 0.8);
  tl.to(els.final, { opacity: 1, y: 0, duration: 0.17, ease: "power2.out" }, 0.8);

  return tl;
}

export function Reveal({ name, tagline, media, credit, framing }: RevealProps) {
  const [first, rest] = splitName(name);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaWrapRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const panelLRef = useRef<HTMLDivElement>(null);
  const panelRRef = useRef<HTMLDivElement>(null);
  const edgeLRef = useRef<HTMLDivElement>(null);
  const edgeRRef = useRef<HTMLDivElement>(null);
  const nameLRef = useRef<HTMLSpanElement>(null);
  const nameRRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLAnchorElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const creditRef = useRef<HTMLParagraphElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const debug = useDebugMode();
  const [debugPct, setDebugPct] = useState(0);

  useGSAP(
    () => {
      // Read the debug flag here rather than depending on the `debug` state.
      // That state starts false (its SSR snapshot) and flips after hydration,
      // and re-running this setup mid-life leaves the previous run's
      // pin-spacing behind — the spacer ends up with double the pin distance
      // and the stage parks at the end of its range. Effects only ever run on
      // the client, so reading the URL directly here is always accurate and
      // lets the whole setup run exactly once.
      const markers = new URLSearchParams(window.location.search).has("debug");

      const refs = {
        stage: stageRef.current,
        media: mediaWrapRef.current,
        dark: darkOverlayRef.current,
        seam: seamRef.current,
        panelL: panelLRef.current,
        panelR: panelRRef.current,
        edgeL: edgeLRef.current,
        edgeR: edgeRRef.current,
        nameL: nameLRef.current,
        nameR: nameRRef.current,
        cue: cueRef.current,
        skip: skipRef.current,
        shade: shadeRef.current,
        final: finalRef.current,
      };
      if (Object.values(refs).some((el) => el === null)) return;
      // The credit line is optional markup, so it's attached after the
      // null-guard rather than being required by it.
      const els = { ...refs, credit: creditRef.current } as RevealEls;

      const mm = gsap.matchMedia();

      // Reduced motion: end state, no scroll listener, nothing to reverse.
      // Photo already revealed, title already settled.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(els.dark, { opacity: 0 });
        gsap.set(els.media, { scale: 1 });
        gsap.set(
          [els.seam, els.panelL, els.panelR, els.edgeL, els.edgeR, els.nameL, els.nameR, els.cue],
          { opacity: 0 },
        );
        // Nothing to skip when the reveal never plays.
        gsap.set(els.skip, { autoAlpha: 0 });
        gsap.set(els.shade, { opacity: 1 });
        gsap.set(els.final, { opacity: 1, y: 0 });
        if (els.credit) gsap.set(els.credit, { opacity: 1 });
      });

      mm.add(
        {
          motionOk: "(prefers-reduced-motion: no-preference)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { motionOk, isMobile } = context.conditions as {
            motionOk: boolean;
            isMobile: boolean;
          };
          if (!motionOk) return;

          // Baseline (scroll progress 0): pure black, name centered, nothing revealed.
          gsap.set(els.dark, { opacity: 1 });
          gsap.set(els.media, { scale: 1.06 });
          gsap.set(els.seam, { scaleY: 0, opacity: 1, transformOrigin: "top" });
          gsap.set([els.nameL, els.nameR], { x: 0, opacity: 1 });
          gsap.set([els.edgeL, els.edgeR], { opacity: 0 });
          gsap.set(els.shade, { opacity: 0 });
          gsap.set(els.final, { opacity: 0, y: 16 });
          gsap.set(els.cue, { opacity: 1 });
          gsap.set(els.skip, { autoAlpha: 1 });
          if (els.credit) gsap.set(els.credit, { opacity: 0 });

          // Pin the stage itself and let ScrollTrigger generate the scroll
          // distance as pin-spacing. Pinning a *child* while triggering off a
          // tall parent with a bottom-relative end is a feedback loop: the
          // spacing grows the parent, which pushes its bottom down, which
          // demands more spacing.
          scrollTriggerRef.current = ScrollTrigger.create({
            id: "hero",
            trigger: els.stage,
            start: "top top",
            end: () => "+=" + window.innerHeight * (isMobile ? 2 : 2.8),
            pin: true,
            scrub: HERO_SCRUB_SECONDS,
            markers,
            invalidateOnRefresh: true,
            animation: buildTimeline(els),
            onUpdate: (self) => setDebugPct(Math.round(self.progress * 100)),
          });
        },
      );

      // gsap.matchMedia() owns its own context, which useGSAP's cleanup does
      // NOT revert for us. Without this, React's StrictMode double-invoke in
      // development leaves the first run's ScrollTrigger alive and the page
      // ends up with two pin-spacers stacked on top of each other.
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] },
  );

  const framingKey = `${framing.mobile}/${framing.desktop}` as const;
  const { wrapper: framingWrapper, object: framingObject } = FRAMING_CLASSES[framingKey];

  // Art direction: the phone crop is a different composition, not just a
  // smaller file, so it needs <picture>/<source> rather than a resize.
  const sharedImgProps = { alt: media.alt, sizes: "100vw", quality: 82 };
  const { props: desktopImgProps } = getImageProps({
    ...sharedImgProps,
    src: media.src,
    width: media.width,
    height: media.height,
  });
  const mobileSrcSet =
    media.mobileSrc && media.mobileWidth && media.mobileHeight
      ? getImageProps({
          ...sharedImgProps,
          src: media.mobileSrc,
          width: media.mobileWidth,
          height: media.mobileHeight,
        }).props.srcSet
      : undefined;

  function onScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const st = scrollTriggerRef.current;
    if (!st) return;
    const p = Number(e.target.value) / 100;
    st.scroll(st.start + p * (st.end - st.start));
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Opening reveal"
      // No explicit height: ScrollTrigger's pin-spacing supplies the scroll
      // distance (see the `end` value — 200vh of scrub on mobile, 280vh on
      // desktop). Under reduced motion nothing is pinned, so this collapses
      // to a single viewport-height stage.
      className="relative"
    >
      <div
        ref={stageRef}
        className="relative h-dvh overflow-hidden bg-bg motion-reduce:h-auto motion-reduce:min-h-dvh"
      >
        {/* Media slot — image today, a <video> slots into the same wrapper later. */}
        <div ref={mediaWrapRef} className={`absolute z-[1] ${framingWrapper}`}>
          <picture>
            {mobileSrcSet && (
              <source media="(max-width: 767px)" srcSet={mobileSrcSet} sizes="100vw" />
            )}
            {/*
              A real <picture> rather than two <Image>s toggled with CSS: a
              hidden <img> still gets fetched, and next/image's own docs warn
              that eager-loading both is exactly what happens if you mark them
              priority. This way the browser commits to one file before it
              downloads anything.

              fetchPriority high (not `priority`) because the hero is the LCP
              element; the <img> is in the initial HTML, so the preload scanner
              finds it immediately anyway.
            */}
            <img
              {...desktopImgProps}
              alt={media.alt}
              fetchPriority="high"
              decoding="async"
              className={`hero-media absolute inset-0 h-full w-full ${framingObject}`}
              style={
                {
                  "--hero-op-mobile": media.mobileObjectPosition ?? media.objectPosition,
                  "--hero-op-desktop": media.objectPosition,
                } as React.CSSProperties
              }
            />
          </picture>
        </div>

        {/* Covers the photo at rest; fades out to reveal it. */}
        <div ref={darkOverlayRef} className="absolute inset-0 z-[2] bg-bg motion-reduce:hidden" />

        {/* Two flat panels with a faint two-tone grain — "two surfaces," not fabric. */}
        <div
          ref={panelLRef}
          style={{ transformOrigin: "0 0" }}
          className="absolute inset-y-0 left-0 z-[3] w-[51%] motion-reduce:hidden [background:repeating-linear-gradient(90deg,#000_0,#060606_44px,#000_88px)]"
        >
          <div
            ref={edgeLRef}
            className="absolute inset-y-0 right-0 w-[90px] opacity-0 [background:linear-gradient(to_left,rgba(255,214,170,.3),rgba(255,214,170,0))]"
          />
        </div>
        <div
          ref={panelRRef}
          style={{ transformOrigin: "100% 0" }}
          className="absolute inset-y-0 right-0 z-[3] w-[51%] motion-reduce:hidden [background:repeating-linear-gradient(90deg,#000_0,#060606_44px,#000_88px)]"
        >
          <div
            ref={edgeRRef}
            className="absolute inset-y-0 left-0 w-[90px] opacity-0 [background:linear-gradient(to_right,rgba(255,214,170,.3),rgba(255,214,170,0))]"
          />
        </div>

        {/* The seam of light, exactly centered in the gap between the names. */}
        <div
          ref={seamRef}
          aria-hidden
          className="absolute inset-y-0 left-1/2 z-[4] w-px -translate-x-1/2 motion-reduce:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,214,170,0), rgba(255,214,170,.95) 28%, rgba(255,214,170,.95) 72%, rgba(255,214,170,0))",
            boxShadow: "0 0 14px 2px rgba(255,190,120,.35)",
          }}
        />

        {/*
          The split name is a presentational duplicate of the real <h1>
          below, so it's hidden from assistive tech and search engines —
          otherwise "Shane Lonergan" would be announced/indexed twice.
          Each half is half the stage wide, padded a fifth of an em toward
          center, so the gap between them lands exactly on the seam
          regardless of font metrics — never a single string clipped in half.
        */}
        <div aria-hidden className="absolute inset-0 z-[8] motion-reduce:hidden">
          <span
            ref={nameLRef}
            className="absolute top-1/2 left-0 w-1/2 -translate-y-1/2 pr-[0.125em] text-right text-[clamp(24px,6.4vw,88px)] leading-none font-medium tracking-[-0.02em] whitespace-nowrap"
          >
            {first}
          </span>
          <span
            ref={nameRRef}
            className="absolute top-1/2 left-1/2 w-1/2 -translate-y-1/2 pl-[0.125em] text-[clamp(24px,6.4vw,88px)] leading-none font-medium tracking-[-0.02em] whitespace-nowrap"
          >
            {rest}
          </span>
        </div>

        {/* Legibility gradient — arrives with the settled title, not before. */}
        <div
          ref={shadeRef}
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-[7] h-1/2 opacity-0 motion-reduce:opacity-100 [background:linear-gradient(to_top,rgba(0,0,0,.72),rgba(0,0,0,0)_55%)]"
        />

        {/* The one real, visible, indexable heading — settles bottom-left like a film title card. */}
        <div
          ref={finalRef}
          className="absolute bottom-10 left-6 z-[8] opacity-0 motion-reduce:opacity-100 sm:bottom-14 sm:left-10"
        >
          <h1 className="text-[clamp(34px,5.2vw,72px)] leading-none font-medium tracking-[-0.015em] text-fg">
            {name}
          </h1>
          <p className="mt-3 text-[12px] tracking-[0.2em] text-fg-muted">{tagline}</p>
        </div>

        {/* Credits the photograph, so it arrives with the photograph. */}
        {credit && (
          <p
            ref={creditRef}
            className="absolute right-4 bottom-3 z-[8] text-[11px] text-fg-muted/70 opacity-0 motion-reduce:opacity-100"
          >
            {credit}
          </p>
        )}

        <div
          ref={cueRef}
          aria-hidden
          className="absolute inset-x-0 bottom-[8%] z-[9] text-center text-[13px] tracking-[0.24em] text-fg-muted motion-reduce:hidden"
        >
          Scroll
          <span className="mx-auto mt-3 block h-9 w-px animate-[draw_2.4s_ease-in-out_infinite] bg-fg-muted" />
        </div>

        {/* Bypasses the reveal entirely — see the casting-director fast path in the brief. */}
        {/*
          Sits bottom-left on phones: at 375px the fast-path nav already
          reaches within ~60px of the left edge up top, and this link is
          wider than that.
        */}
        <a
          ref={skipRef}
          href="#next"
          className="absolute bottom-6 left-5 z-10 text-[13px] text-fg-muted transition-colors hover:text-accent sm:top-5 sm:bottom-auto"
        >
          Skip to the show
        </a>
      </div>

      {debug && (
        <div className="fixed bottom-3 left-3 z-50 flex items-center gap-3 rounded-md border border-accent/30 bg-bg/90 px-3 py-2 text-[12px] text-fg backdrop-blur">
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={0}
            onChange={onScrub}
            className="w-40 accent-accent"
            aria-label="Hero scroll progress"
          />
          <output className="tabular-nums">{debugPct}%</output>
        </div>
      )}
    </section>
  );
}
