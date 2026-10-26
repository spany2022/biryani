"use client";

import { useRef } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import SplitHeading from "@/components/ui/SplitHeading";
import Steam from "@/components/ui/Steam";
import { business } from "@/data/business";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";

export default function Closing() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionQueries.motion, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true },
        });
        tl.fromTo("[data-close-bg]", { scale: 1.25 }, { scale: 1.02 }, 0)
          .fromTo("[data-close-dish]", { yPercent: 25, scale: 0.9 }, { yPercent: 0, scale: 1 }, 0)
          .fromTo("[data-close-glow]", { opacity: 0 }, { opacity: 1 }, 0.3);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const findHref = business.mapsUrl ?? "#visit";

  return (
    <section
      ref={root}
      id="order"
      aria-labelledby="closing-title"
      className="on-dark relative isolate flex min-h-[100svh] items-center overflow-hidden bg-midnight py-28 text-cream"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div data-close-bg className="absolute inset-0">
          <Image src="/images/hero-interior.jpg" alt="" fill sizes="100vw" quality={60} className="object-cover opacity-30" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,transparent,rgb(23_18_15/0.92)_70%)]" />
        <div
          data-close-glow
          className="absolute bottom-[-10%] left-1/2 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(214_166_79/0.35),transparent)] blur-2xl"
        />
      </div>

      <div className="mx-auto grid w-full max-w-[90rem] items-center gap-12 px-5 md:px-10 lg:grid-cols-2">
        <div className="relative z-10 text-center lg:text-left">
          <p className="eyebrow text-saffron">Your table is waiting</p>
          <SplitHeading
            id="closing-title"
            lines={[["Your Next"], [{ text: "Favourite Biryani", italic: true, className: "text-saffron" }], ["Awaits."]]}
            className="mt-5 font-serif text-display font-light"
          />
          <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-cream/70 lg:mx-0">
            Discover the aroma, the tradition, and the unforgettable taste of Hyderabadi Dum Biryani.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button href="#signature" variant="gold">
              Order Biryani Now
            </Button>
            <Button href={findHref} variant="outline-light" icon={<MapPin className="h-4 w-4" strokeWidth={1.75} />}>
              Find Our Restaurant
            </Button>
          </div>
        </div>
        <div data-close-dish className="relative mx-auto aspect-square w-full max-w-[34rem]">
          <div className="arch-mask absolute inset-0 overflow-hidden border border-saffron/25">
            <Image
              src="/images/story-first-bite.jpg"
              alt="A spoonful of biryani lifted from the bowl, steam rising"
              fill
              sizes="(min-width: 1024px) 34rem, 90vw"
              className="object-cover object-[50%_45%]"
            />
          </div>
          <Steam className="bottom-[55%] left-[20%] h-[50%] w-[60%]" />
        </div>
      </div>
    </section>
  );
}
