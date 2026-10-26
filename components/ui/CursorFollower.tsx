"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, motionQueries } from "@/lib/gsap";

/**
 * A soft saffron ring that follows the pointer only while it is over an element
 * marked `data-cursor="Label"` (food cards, gallery images). The native cursor is
 * never hidden. Fine pointers with motion allowed only.
 */
export default function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`${motionQueries.finePointer} and ${motionQueries.motion}`);
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    let active: Element | null = null;

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as Element | null)?.closest?.("[data-cursor]") ?? null;
      if (target !== active) {
        active = target;
        const text = target?.getAttribute("data-cursor") ?? "";
        setLabel(text);
        gsap.to(el, { scale: target ? 1 : 0, opacity: target ? 1 : 0, duration: 0.4, ease: "expo.out" });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] -ml-11 -mt-11 flex h-22 w-22 scale-0 items-center justify-center rounded-full bg-saffron/90 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-midnight opacity-0 mix-blend-normal backdrop-blur-sm"
    >
      {label}
    </div>
  );
}
