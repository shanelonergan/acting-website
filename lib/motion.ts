/**
 * Shared motion constants. One easing curve, one duration, reused everywhere
 * outside the hero's scrubbed timeline — see the design plan's "transition
 * language" section. Keeping these in one place means nothing drifts.
 */

/** A soft "expo out" — slow settle, no bounce. Used for every non-scrubbed reveal. */
export const EASE_SLOW = "cubic-bezier(0.22, 1, 0.36, 1)" as const;

/** GSAP wants the plain array form of the same curve. */
export const EASE_SLOW_GSAP = [0.22, 1, 0.36, 1] as const;

/** Fade + upward drift used for section entries, nav reveals, gallery images. */
export const SECTION_DURATION_MS = 800;
export const SECTION_DRIFT_PX = 12;

/** How far the pinned hero timeline lags the actual scroll position, in seconds. */
export const HERO_SCRUB_SECONDS = 0.85;
