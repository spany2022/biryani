"use client";

import { useRef } from "react";
import Image from "next/image";
import SplitHeading from "@/components/ui/SplitHeading";
import Steam from "@/components/ui/Steam";
import { dumSteps } from "@/data/story";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";

/**
 * A horizontal timeline of the dum method. The gold line draws itself as the
 * section scrolls through, and each step's arch-framed image rises into view
 * as the line reaches it. Vertical on small screens.
 */
export default function DumArt() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionQueries.motion, () => {
        const q = gsap.utils.selector(root);
        const steps = q("[data-step]");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: q("[data-timeline]")[0], start: "top 78%", end: "bottom 45%", scrub: 0.8 },
        });
        tl.fromTo(q("[data-line]"), { scale: 0 }, { scale: 1, duration: steps.length }, 0);
        steps.forEach((step, i) => {
          const media = step.querySelector("[data-step-media]");
          const node = step.querySelector("[data-step-node]");
          const copy = step.querySelectorAll("[data-step-copy]");
          tl.fromTo(node, { scale: 0.3, backgroundColor: "rgba(214,166,79,0)" }, { scale: 1, backgroundColor: "rgba(214,166,79,1)", duration: 0.3 }, i + 0.1)
            .fromTo(media, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.out" }, i)
            .fromTo(copy, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.1 }, i + 0.2);
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="dum"
      aria-labelledby="dum-title"
      className="on-dark relative overflow-hidden bg-midnight py-28 text-cream md:py-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[40rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(169_95_56/0.22),transparent)] blur-2xl"
      />
      <div className="relative mx-auto max-w-[90rem] px-5 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow flex items-center gap-4 text-saffron">
              The Art of Dum
              <span aria-hidden="true" className="urdu text-2xl normal-case tracking-normal text-saffron/70">
                دم
              </span>
            </p>
            <SplitHeading
              id="dum-title"
              lines={[["Sealed in Tradition."], [{ text: "Perfected by Dum.", italic: true, className: "text-saffron" }]]}
              className="mt-5 font-serif text-headline font-light"
            />
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-cream/70">
            Layered with fragrant basmati rice, aromatic spices and carefully prepared ingredients, Hyderabadi Dum Biryani
            celebrates the patience and craft behind every serving.
          </p>
        </div>

        <ol data-timeline className="relative mt-20 grid gap-14 md:mt-28 lg:grid-cols-5 lg:gap-6">
          {/* Connecting line: vertical on mobile, horizontal on desktop */}
          <span aria-hidden="true" className="absolute bottom-0 left-[0.6rem] top-0 w-px bg-cream/12 lg:left-0 lg:right-0 lg:top-[calc(var(--spacing)*64+1.6rem)] lg:bottom-auto lg:h-px lg:w-auto">
            <span data-line className="absolute inset-0 origin-top bg-saffron lg:origin-left" />
          </span>

          {dumSteps.map((step, i) => (
            <li key={step.title} data-step className="relative pl-10 lg:pl-0">
              <div
                data-step-media
                className="arch-mask relative h-64 overflow-hidden border border-saffron/20 bg-charcoal lg:h-64"
              >
                <Image src={step.image} alt={step.alt} fill sizes="(min-width: 1024px) 18vw, 80vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 to-transparent" />
                {(i === 2 || i === 3) && <Steam className="bottom-[30%] left-[15%] h-[60%] w-[70%]" />}
              </div>
              <span
                data-step-node
                aria-hidden="true"
                className="absolute left-0 top-0 h-[1.25rem] w-[1.25rem] rounded-full border border-saffron bg-saffron lg:left-0 lg:top-[calc(var(--spacing)*64+1rem)]"
              />
              <div className="mt-6 lg:mt-14">
                <p data-step-copy className="font-serif text-lg text-saffron">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 data-step-copy className="mt-1 font-serif text-3xl">
                  {step.title}
                </h3>
                <p data-step-copy className="mt-3 text-sm leading-relaxed text-cream/65">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
