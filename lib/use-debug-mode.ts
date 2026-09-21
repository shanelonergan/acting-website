"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  // The debug flag only ever comes from the URL at load time — nothing to
  // subscribe to. useSyncExternalStore is still the right tool here (over
  // state-set-in-an-effect): it gives a consistent, non-crashing SSR
  // snapshot (`false`) and lets React handle the one-time client update.
  return () => {};
}

function getSnapshot() {
  return new URLSearchParams(window.location.search).has("debug");
}

function getServerSnapshot() {
  return false;
}

/** Dev-only: `?debug` turns on ScrollTrigger markers and the manual scrub slider. */
export function useDebugMode() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
