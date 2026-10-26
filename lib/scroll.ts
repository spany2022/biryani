"use client";

import type Lenis from "lenis";

/**
 * A tiny store for the active Lenis instance so any component can scroll
 * programmatically (anchor links, dialogs) without a context provider.
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

/** Smoothly scroll to a hash target, falling back to native behaviour. */
export const scrollToHash = (hash: string) => {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return false;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  // Move focus for keyboard and screen-reader users without a second jump.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  history.replaceState(null, "", hash);
  return true;
};

export const lockScroll = (locked: boolean) => {
  const lenis = getLenis();
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.classList.toggle("scroll-locked", locked);
};
