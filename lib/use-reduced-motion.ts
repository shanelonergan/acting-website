"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Tracks `prefers-reduced-motion`, live. Layout must not rely on this for the
 * *first* paint (that's handled by `motion-reduce:` CSS, which the browser
 * applies with no hydration flash) — use it only to gate JS-driven work like
 * creating a ScrollTrigger or a Lenis instance.
 *
 * useSyncExternalStore (rather than state-set-in-an-effect) is what keeps
 * this safe under React's Strict Mode / Compiler: the server snapshot is
 * always `false`, and React reconciles the real value itself after hydration.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
