"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Mounted once in the root layout. Syncs Lenis's smoothed scroll position
 * into ScrollTrigger every frame, and drives both off gsap.ticker so there's
 * a single rAF loop for the whole site instead of two competing ones.
 *
 * Lenis operates on the native window scroll (no wrapper div), so the
 * scrollbar, keyboard scrolling, and scroll restoration all keep working —
 * it only smooths the motion between scroll events.
 *
 * Skipped entirely under prefers-reduced-motion: a smoothing lag on top of
 * an already-motion-sensitive visitor's scroll is exactly what that setting
 * asks us not to do.
 */
export function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return null;
}
