"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "@/components/ui/Button";
import SplitHeading from "@/components/ui/SplitHeading";
import ReservationForm from "@/components/sections/ReservationForm";
import { business } from "@/data/business";
import { gallery } from "@/data/story";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";
import { lockScroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const lightboxButton =
  "inline-flex h-11 w-11 items-center justify-center rounded-full bg-midnight/70 text-cream backdrop-blur transition-colors hover:bg-saffron hover:text-midnight";

const spans = {
  tall: "md:row-span-2",
  wide: "md:col-span-2",
  square: "",
};

export default function Dining() {
  const root = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionQueries.motion, () => {
        const q = gsap.utils.selector(root);
        q("[data-gallery-item]").forEach((item) => {
          gsap.fromTo(
            item,
            { clipPath: "inset(12% 8% 12% 8% round 1.5rem)", autoAlpha: 0.2 },
            {
              clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
              autoAlpha: 1,
              duration: 1.4,
              ease: "expo.out",
              scrollTrigger: { trigger: item, start: "top 88%", once: true },
            }
          );
          const img = item.querySelector("img");
          gsap.fromTo(
            img,
            { yPercent: -6 },
            { yPercent: 6, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true } }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (index !== null && !d.open) {
      d.showModal();
      lockScroll(true);
    } else if (index === null && d.open) d.close();
  }, [index]);

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + gallery.length) % gallery.length)),
    []
  );

  const current = index === null ? null : gallery[index];
  const closeLightbox = () => dialogRef.current?.close();

  return (
    <section
      ref={root}
      id="dining"
      aria-labelledby="dining-title"
      className="on-dark relative bg-midnight py-28 text-cream md:py-36"
    >
      <div className="mx-auto max-w-[90rem] px-5 md:px-10">
        <header className="max-w-3xl">
          <p className="eyebrow text-saffron">The Royal Dining Experience</p>
          <SplitHeading
            id="dining-title"
            lines={[["A Taste of Hyderabad."], [{ text: "An Experience Beyond the Plate.", italic: true, className: "text-saffron" }]]}
            className="mt-5 font-serif text-headline font-light"
          />
          <p className="mt-6 max-w-xl leading-relaxed text-cream/70">
            Warm light, copper and brass at the table, and room for the whole family. Come for a quiet dinner or bring the
            celebration with you.
          </p>
        </header>

        <ul className="mt-16 grid auto-rows-[16rem] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[18rem] md:grid-cols-4 md:gap-5">
          {gallery.map((g, i) => (
            <li key={g.src} data-gallery-item className={cn("relative overflow-hidden rounded-[1.5rem]", spans[g.span])}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                data-cursor="Open"
                className="group absolute inset-0 block h-full w-full"
                aria-label={`Open photo: ${g.caption}`}
              >
                <span className="absolute -inset-y-[8%] inset-x-0 block">
                  <Image
                    src={g.src}
                    alt={g.alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  />
                </span>
                <span className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                <span className="absolute bottom-4 left-5 text-left font-serif text-xl">{g.caption}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-cream/45">Placeholder photography — to be replaced with the restaurant&apos;s own.</p>

        {/* Visit / reserve */}
        <div id="reserve" className="mt-24 grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <h3 className="font-serif text-title">
              {business.services.reservations ? "Reserve your table" : "Visit us"}
            </h3>
            <p className="mt-4 max-w-md leading-relaxed text-cream/70">
              {business.services.reservations
                ? "Tell us when you'd like to come and how many will join. We'll call to confirm — for groups larger than twenty, send a feast enquiry instead."
                : "Walk in for dinner or order ahead for takeaway — the biryani travels beautifully."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#signature" variant="outline-light">
                Order for takeaway
              </Button>
              {business.services.eventCatering && (
                <Button href="#feasts" variant="outline-light">
                  Plan a feast
                </Button>
              )}
            </div>
          </div>
          {business.services.reservations && <ReservationForm />}
        </div>
      </div>

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        className="panel fade on-dark w-[min(80rem,calc(100vw-1.5rem))]"
        aria-label="Photo viewer"
        onClose={() => {
          lockScroll(false);
          setIndex(null);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {current && (
          <figure className="relative">
            <div className="relative h-[min(80dvh,56rem)] w-full overflow-hidden rounded-[1.5rem] bg-charcoal">
              <Image src={current.src} alt={current.alt} fill sizes="90vw" quality={85} className="object-contain" />
            </div>
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-cream">
              <span className="font-serif text-2xl">{current.caption}</span>
              <span className="text-sm tabular-nums text-cream/60">
                {(index ?? 0) + 1} / {gallery.length}
              </span>
            </figcaption>
            <div className="absolute right-3 top-3 flex gap-2">
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={lightboxButton}>
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className={lightboxButton}>
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button type="button" onClick={closeLightbox} aria-label="Close" className={lightboxButton}>
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </figure>
        )}
      </dialog>
    </section>
  );
}
