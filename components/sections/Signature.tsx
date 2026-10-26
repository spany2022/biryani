"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import AddToCart from "@/components/cart/AddToCart";
import DishDialog from "@/components/ui/DishDialog";
import { BadgeTag, DietMark, SpiceLevel } from "@/components/ui/DishMeta";
import SplitHeading from "@/components/ui/SplitHeading";
import { getLenis } from "@/lib/scroll";
import { gsap, ScrollTrigger, useGSAP, motionQueries, queueRefresh } from "@/lib/gsap";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The commercial heart of the page. On large screens with motion allowed, the
 * collection is a pinned horizontal shelf; everywhere else it's a simple,
 * touch-friendly grid.
 */
export default function Signature() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { menu } = useCart();
  const items = menu.filter((m) => m.signature);
  const [shelf, setShelf] = useState(false);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`${motionQueries.motion} and ${motionQueries.desktop}`);
    const update = () => setShelf(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      if (shelf && track.current) {
        const el = track.current;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        triggerRef.current = tween.scrollTrigger ?? null;

        q("[data-card-media]").forEach((card) => {
          gsap.fromTo(
            card,
            { clipPath: "inset(18% 12% 18% 12% round 1.5rem)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
              ease: "power2.out",
              scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 95%", end: "left 55%", scrub: true },
            }
          );
        });
      } else {
        triggerRef.current = null;
        mm.add(motionQueries.motion, () => {
          ScrollTrigger.batch(q("[data-card]"), {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.fromTo(
                batch,
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.08 }
              ),
          });
        });
      }

      // Restrained 3D tilt on fine pointers.
      mm.add(`${motionQueries.motion} and ${motionQueries.finePointer}`, () => {
        const cleanups = (q("[data-tilt]") as HTMLElement[]).map((card) => {
          const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
          gsap.set(card, { transformPerspective: 1000 });
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 7);
            rx(((e.clientY - r.top) / r.height - 0.5) * -7);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          return () => {
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
          };
        });
        return () => cleanups.forEach((c) => c());
      });

      queueRefresh();
      return () => mm.revert();
    },
    { scope: root, dependencies: [shelf, items.length], revertOnUpdate: true }
  );

  // Keep keyboard focus visible inside the pinned shelf by scrolling the page to it.
  const onFocusCapture = (e: React.FocusEvent) => {
    const st = triggerRef.current;
    const el = track.current;
    if (!st || !el) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    if (!card) return;
    const distance = el.scrollWidth - window.innerWidth;
    const targetX = Math.min(distance, Math.max(0, card.offsetLeft - window.innerWidth * 0.3));
    const y = st.start + (targetX / distance) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo({ top: y });
  };

  return (
    <section
      ref={root}
      id="signature"
      aria-labelledby="signature-title"
      className="on-dark relative overflow-hidden bg-charcoal text-cream"
    >
      <div className="grain" aria-hidden="true" />
      <div
        ref={track}
        onFocusCapture={onFocusCapture}
        className={cn(
          "relative",
          shelf
            ? "flex h-[100svh] w-max items-center gap-8 pl-10 pr-[12vw] pt-16"
            : "mx-auto max-w-[90rem] px-5 py-28 md:px-10"
        )}
      >
        <header className={cn(shelf ? "w-[30rem] shrink-0 pr-8" : "max-w-2xl")}>
          <p className="eyebrow text-saffron">The Signature Collection</p>
          <SplitHeading
            id="signature-title"
            lines={[["Biryani worth"], [{ text: "crossing the city", italic: true, className: "text-saffron" }], ["for."]]}
            className="mt-5 font-serif text-headline font-light"
          />
          <p className="mt-6 max-w-md leading-relaxed text-cream/70">
            Layered in the handi and finished on dum. Choose a single serving, a full for two, or a family portion for the
            table.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream/15 px-4 py-2 text-xs text-cream/60">
            Sample menu — dishes and prices to be confirmed
          </p>
        </header>

        <ul
          className={cn(
            shelf ? "flex gap-8" : "mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}
          aria-label="Signature biryani"
        >
          {items.map((item, i) => (
            <li
              key={item.id}
              data-card
              className={cn(shelf && "w-[min(22rem,38vh)] shrink-0", shelf && i % 2 === 1 && "mt-[6vh]")}
            >
              <article data-tilt className="group flex h-full flex-col will-change-transform">
                <button
                  type="button"
                  data-cursor="View"
                  onClick={() => setSelected(item)}
                  className="relative block overflow-hidden rounded-[1.5rem] text-left"
                  aria-label={`View details for ${item.name}`}
                >
                  <div data-card-media className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-midnight">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 23rem, (min-width: 640px) 45vw, 100vw"
                      className={cn(
                        "object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]",
                        !item.available && "grayscale"
                      )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {item.badges.map((b) => (
                        <BadgeTag key={b} badge={b} />
                      ))}
                      {!item.available && (
                        <span className="rounded-full bg-midnight/80 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em]">
                          Unavailable today
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-4 left-4 font-serif text-5xl font-light text-cream/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </button>
                <div className="mt-5 flex items-center gap-3 text-cream/70">
                  <DietMark isVeg={item.isVeg} />
                  <SpiceLevel level={item.spice} className="text-saffron" />
                </div>
                <h3 className="mt-3 font-serif text-[1.85rem] leading-tight">{item.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-cream/65">{item.description}</p>
                <AddToCart item={item} tone="dark" className="mt-auto pt-5" />
              </article>
            </li>
          ))}
        </ul>
      </div>
      <DishDialog item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
