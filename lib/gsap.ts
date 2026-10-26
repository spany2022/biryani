"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 1 });
}

/** Media query conditions used with gsap.matchMedia(). */
export const motionQueries = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 1024px)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

/**
 * Sections that switch layout after mount (pinned shelf, cinematic story) change
 * the page height, so every trigger below them must be re-measured — in DOM order,
 * so pin spacing is accounted for.
 */
let refreshQueued = false;
export const queueRefresh = () => {
  if (refreshQueued || typeof window === "undefined") return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
};

export { gsap, ScrollTrigger, useGSAP };
