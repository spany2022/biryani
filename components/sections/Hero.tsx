"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import SplitHeading, { type SplitLines } from "@/components/ui/SplitHeading";
import Steam from "@/components/ui/Steam";
import { useCart } from "@/components/cart/CartProvider";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";
import { formatPrice, fromPrice } from "@/lib/money";

const headline: SplitLines = [
  ["Every Grain"],
  ["Tells a", { text: "Royal", italic: true, className: "text-saffron" }],
  ["Story."],
];

/**
 * Cinematic opening: a handi of dum biryani in warm light, steam rising, the
 * restaurant interior softly behind. Entrance is pure CSS (first paint); scroll
 * push, light shift and pointer parallax are layered on with GSAP.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const { menu } = useCart();
  const featured = menu.find((m) => m.signature && m.available && m.badges.includes("bestseller")) ??
    menu.find((m) => m.signature && m.available);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(motionQueries.motion, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        tl.to("[data-scroll='dish']", { yPercent: 12, scale: 1.1 }, 0)
          .to("[data-scroll='bg']", { yPercent: 22, scale: 1.05 }, 0)
          .to("[data-scroll='content']", { yPercent: -18, opacity: 0.15 }, 0)
          .to("[data-scroll='glow']", { opacity: 0.25, xPercent: -8, yPercent: 10 }, 0)
          .to("[data-scroll='veil']", { opacity: 0.75 }, 0);
      });

      mm.add(`${motionQueries.motion} and ${motionQueries.finePointer} and ${motionQueries.desktop}`, () => {
        const bgX = gsap.quickTo("[data-pointer='bg']", "x", { duration: 1.4, ease: "power3.out" });
        const bgY = gsap.quickTo("[data-pointer='bg']", "y", { duration: 1.4, ease: "power3.out" });
        const dishX = gsap.quickTo("[data-pointer='dish']", "x", { duration: 1.1, ease: "power3.out" });
        const dishY = gsap.quickTo("[data-pointer='dish']", "y", { duration: 1.1, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          bgX(nx * -18);
          bgY(ny * -12);
          dishX(nx * 22);
          dishY(ny * 14);
        };
        const el = root.current!;
        el.addEventListener("pointermove", onMove);
        return () => el.removeEventListener("pointermove", onMove);
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="on-dark relative flex min-h-[100svh] flex-col overflow-hidden bg-midnight text-cream lg:block lg:h-[100svh] lg:min-h-[720px]"
    >
      {/* Restaurant interior, far layer */}
      <div data-scroll="bg" className="absolute inset-0">
        <div data-pointer="bg" className="absolute -inset-6">
          <div data-hero-bg className="absolute inset-0">
            <Image
              src="/images/hero-interior.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              quality={60}
              className="object-cover object-[50%_30%] opacity-40 blur-[3px] saturate-[0.9]"
            />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,transparent_0%,rgb(23_18_15/0.55)_45%,rgb(23_18_15/0.96)_80%)]" />
      <div
        data-scroll="veil"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight from-35% via-midnight/70 to-transparent lg:bg-gradient-to-r lg:from-0% lg:via-midnight/75"
      />
      {/* Warm directional light over the dish */}
      <div
        data-scroll="glow"
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[22%] h-[70vh] w-[60vw] max-w-[900px] rounded-full bg-[radial-gradient(closest-side,rgb(214_166_79/0.32),rgb(169_95_56/0.12)_55%,transparent)] blur-2xl motion-safe:animate-flicker"
      />

      {/* The handi — foreground layer */}
      <div className="relative h-[54svh] w-full shrink-0 lg:absolute lg:inset-y-0 lg:right-[2%] lg:h-full lg:w-[56%]">
        <div data-scroll="dish" className="absolute inset-0">
          <div data-pointer="dish" className="absolute inset-0">
            <div
              data-hero-dish
              className="absolute left-1/2 top-[2%] aspect-[2400/3395] h-[108%] -translate-x-1/2 lg:top-[2%] lg:h-[100%]"
            >
              <Image
                src="/images/hero-handi.jpg"
                alt="Hyderabadi dum biryani served in a hammered handi, topped with fried onions, cashews and fresh coriander"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 120vw"
                quality={85}
                className="object-cover [mask-image:radial-gradient(ellipse_50%_42%_at_50%_58%,#000_60%,transparent_100%)]"
              />
              <Steam intensity="rich" className="bottom-[56%] left-[22%] h-[38%] w-[56%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Copy */}
      <div
        data-scroll="content"
        className="relative z-10 mx-auto flex w-full max-w-[90rem] flex-1 flex-col justify-end px-5 pb-24 md:px-10 lg:h-full lg:justify-center lg:pb-0 lg:pt-20"
      >
        <div className="-mt-4 max-w-[46rem] lg:mt-0">
          <p data-hero-fade style={{ "--d": 0 } as React.CSSProperties} className="eyebrow flex items-center gap-4 text-saffron">
            <span className="h-px w-10 bg-saffron/60" aria-hidden="true" />
            The Royal Taste of Hyderabad
          </p>
          <SplitHeading
            as="h1"
            id="hero-title"
            trigger="manual"
            lines={headline}
            className="mt-6 font-serif text-display font-light tracking-[-0.01em]"
          />
          <p
            data-hero-fade
            style={{ "--d": 1 } as React.CSSProperties}
            className="mt-7 max-w-[34rem] text-base leading-relaxed text-cream/75 md:text-lg"
          >
            Fragrant basmati, slow-cooked dum, and generations of Hyderabadi tradition. Discover biryani crafted to be
            remembered.
          </p>
          <div data-hero-fade style={{ "--d": 2 } as React.CSSProperties} className="mt-10 flex flex-wrap gap-3">
            <Button href="#signature" variant="gold">
              Order Signature Biryani
            </Button>
            <Button href="#story" variant="outline-light" icon={<ArrowDown className="h-4 w-4" strokeWidth={1.75} />}>
              Discover Our Story
            </Button>
          </div>
        </div>

        {featured && (
          <a
            href="#signature"
            data-hero-fade
            style={{ "--d": 4 } as React.CSSProperties}
            className="group mt-10 flex max-w-sm items-center gap-4 rounded-2xl border border-cream/15 bg-midnight/50 p-3 pr-5 backdrop-blur-md transition-colors hover:border-saffron/60 lg:absolute lg:bottom-14 lg:right-10 lg:mt-0"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <Image src={featured.image} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="eyebrow block text-[0.6rem] text-saffron">House signature</span>
              <span className="mt-1 block truncate font-serif text-xl">{featured.name}</span>
              <span className="text-sm text-cream/65">from {formatPrice(fromPrice(featured.portions))}</span>
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-saffron transition-transform duration-500 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        )}
      </div>

      {/* Scroll cue */}
      <div
        data-hero-fade
        style={{ "--d": 5 } as React.CSSProperties}
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
      >
        <span className="text-[0.6rem] uppercase tracking-[0.4em] text-cream/55">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-cream/15">
          <span className="absolute inset-0 animate-scroll-cue bg-saffron" />
        </span>
      </div>
    </section>
  );
}
