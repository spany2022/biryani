"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import AddToCart from "@/components/cart/AddToCart";
import { BadgeTag, DietMark, SpiceLevel } from "@/components/ui/DishMeta";
import { categories } from "@/data/menu";
import { lockScroll } from "@/lib/scroll";
import type { MenuItem } from "@/lib/types";

/** Expanded view of a dish: large photo, full description, portions and ordering. */
export default function DishDialog({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (item && !d.open) {
      d.showModal();
      lockScroll(true);
    } else if (!item && d.open) d.close();
  }, [item]);

  const category = categories.find((c) => c.id === item?.category);

  return (
    <dialog
      ref={ref}
      className="panel fade on-light w-[min(60rem,calc(100vw-1.5rem))]"
      aria-labelledby="dish-dialog-title"
      onClose={() => {
        lockScroll(false);
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      {item && (
        <div className="grid max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-[1.75rem] bg-cream text-ink shadow-2xl md:grid-cols-[1.05fr_1fr] md:overflow-hidden">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[34rem]">
            <Image src={item.image} alt={item.imageAlt} fill sizes="(min-width: 768px) 30rem, 100vw" className="object-cover" />
            {item.badges.length > 0 && (
              <div className="absolute left-4 top-4 flex gap-2">
                {item.badges.map((b) => (
                  <BadgeTag key={b} badge={b} />
                ))}
              </div>
            )}
          </div>
          <div className="relative flex flex-col p-7 md:overflow-y-auto md:p-10">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-cream transition-colors hover:bg-ink hover:text-cream"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {category && <p className="eyebrow text-copper-ink">{category.name}</p>}
            <h2 id="dish-dialog-title" className="mt-3 pr-12 font-serif text-4xl leading-tight md:text-5xl">
              {item.name}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink/70">
              <span className="inline-flex items-center gap-2">
                <DietMark isVeg={item.isVeg} />
                {item.isVeg ? "Vegetarian" : "Non-vegetarian"}
              </span>
              <SpiceLevel level={item.spice} className="text-copper-ink" />
            </div>
            <p className="mt-6 leading-relaxed text-ink/80">{item.description}</p>
            <div className="mt-auto pt-8">
              <AddToCart item={item} tone="light" />
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
