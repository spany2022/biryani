"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollToHash, setLenis } from "@/lib/scroll";

/**
 * Lenis smooth scrolling driven by GSAP's ticker, so ScrollTrigger and Lenis
 * always agree on the scroll position. Skipped entirely for reduced motion.
 * Also handles in-page anchor links for every section.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      if (reduce.matches || lenis) return;
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    };

    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      tick = null;
      setLenis(null);
    };

    const onPreferenceChange = () => (reduce.matches ? stop() : start());

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      if (scrollToHash(hash)) event.preventDefault();
    };

    start();
    reduce.addEventListener("change", onPreferenceChange);
    document.addEventListener("click", onClick);

    return () => {
      reduce.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("click", onClick);
      stop();
    };
  }, []);

  return null;
}
