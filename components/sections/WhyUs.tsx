"use client";

import { useRef } from "react";
import SplitHeading from "@/components/ui/SplitHeading";
import { reasons, type Reason } from "@/data/story";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";

/** Fine-line icons; their strokes draw in once when the section enters. */
const icons: Record<Reason["icon"], React.ReactNode> = {
  spice: (
    <>
      <path d="M24 6c3 4 3 8 0 12s-3 8 0 12" />
      <path d="M14 22c-4 2-6 6-5 11 1 6 7 9 15 9s14-3 15-9c1-5-1-9-5-11" />
      <path d="M12 30h24" />
      <circle cx="18" cy="12" r="1.6" />
      <circle cx="31" cy="10" r="1.6" />
    </>
  ),
  hands: (
    <>
      <path d="M6 30c4-1 8 0 11 3l5 4c2 2 5 2 7 0l11-9" />
      <path d="M6 38c5 0 9 3 14 4 6 1 12-1 17-5" />
      <path d="M24 8c-3 3-3 7 0 10 3-3 3-7 0-10z" />
      <path d="M24 18v6" />
    </>
  ),
  handi: (
    <>
      <path d="M10 22h28" />
      <path d="M12 22c0 10 5 18 12 18s12-8 12-18" />
      <path d="M16 22c0-5 4-8 8-8s8 3 8 8" />
      <path d="M24 14v-3" />
      <path d="M20 8c1 1 1 2 0 3M28 8c1 1 1 2 0 3" />
    </>
  ),
  celebration: (
    <>
      <path d="M8 40h32" />
      <path d="M12 40V24a12 12 0 0124 0v16" />
      <path d="M24 12V6" />
      <path d="M18 40V28a6 6 0 0112 0v12" />
      <circle cx="24" cy="5" r="1.4" />
    </>
  ),
};

export default function WhyUs() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionQueries.motion, () => {
        const q = gsap.utils.selector(root);
        q("[data-reason]").forEach((card, i) => {
          const paths = card.querySelectorAll<SVGGeometryElement>("path, circle");
          paths.forEach((p) => {
            const len = p.getTotalLength();
            gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          });
          const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 85%", once: true }, delay: i * 0.12 });
          tl.from(card, { y: 50, autoAlpha: 0, duration: 1.1, ease: "expo.out" }).to(
            paths,
            { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.12 },
            0.2
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="why" aria-labelledby="why-title" className="on-light relative bg-ivory py-28 text-ink md:py-36">
      <div className="mx-auto max-w-[90rem] px-5 md:px-10">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-copper-ink">Why Guests Choose Us</p>
          <SplitHeading
            id="why-title"
            lines={[["Hospitality, the"], [{ text: "Hyderabadi way.", italic: true, className: "text-copper" }]]}
            className="mt-5 font-serif text-headline font-light"
          />
        </header>
        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <li
              key={r.title}
              data-reason
              className="group relative flex flex-col rounded-[1.75rem] border border-ink/10 bg-cream p-8 transition-[transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-copper/40 hover:shadow-[0_30px_60px_-30px_rgb(42_32_27/0.35)]"
            >
              <span className="font-serif text-sm text-copper-ink">{String(i + 1).padStart(2, "0")}</span>
              <svg
                viewBox="0 0 48 48"
                className="mt-6 h-14 w-14 text-copper transition-transform duration-700 group-hover:-rotate-3 group-hover:scale-105"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {icons[r.icon]}
              </svg>
              <h3 className="mt-8 font-serif text-[1.9rem] leading-tight">{r.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink/70">{r.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
