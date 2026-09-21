"use client";

import { useEffect, type RefObject } from "react";

/**
 * The site's one arrival transition, as a hook: fade plus a small upward
 * drift, fired once when the element scrolls into view.
 *
 * The element starts visible in the markup and is only hidden once JS has
 * confirmed it can animate it back in, so a JS failure — or a crawler that
 * never runs the observer — still sees the content. Skipped entirely under
 * prefers-reduced-motion.
 */
export function useEnterOnView(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.dataset.enter = "pending";
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.enter = "in";
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
