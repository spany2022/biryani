"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import AddToCart from "@/components/cart/AddToCart";
import DishDialog from "@/components/ui/DishDialog";
import { BadgeTag, DietMark, SpiceLevel } from "@/components/ui/DishMeta";
import SplitHeading from "@/components/ui/SplitHeading";
import { categories } from "@/data/menu";
import { queueRefresh } from "@/lib/gsap";
import type { CategoryId, MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Diet = "all" | "veg" | "nonveg";

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

/**
 * The complete menu. Usability first: filter by category and diet, search by name,
 * see availability, pick a portion and add — no animation stands in the way.
 */
export default function RoyalMenu() {
  const { menu } = useCart();
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [diet, setDiet] = useState<Diet>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const filtered = useMemo(() => {
    const q = normalise(deferredQuery.trim());
    return menu.filter(
      (m) =>
        (category === "all" || m.category === category) &&
        (diet === "all" || (diet === "veg" ? m.isVeg : !m.isVeg)) &&
        (!q || normalise(`${m.name} ${m.description}`).includes(q))
    );
  }, [menu, category, diet, deferredQuery]);

  // Filtering changes the page height; re-measure scroll animations once the list settles.
  useEffect(() => {
    const t = window.setTimeout(queueRefresh, 700);
    return () => window.clearTimeout(t);
  }, [filtered.length]);

  const groups = categories
    .map((c) => ({ ...c, items: filtered.filter((m) => m.category === c.id) }))
    .filter((g) => g.items.length > 0);

  const resetFilters = () => {
    setCategory("all");
    setDiet("all");
    setQuery("");
  };

  const summary =
    filtered.length === 0
      ? "No dishes match your filters."
      : `Showing ${filtered.length} ${filtered.length === 1 ? "dish" : "dishes"}.`;

  return (
    <section id="menu" aria-labelledby="menu-title" className="on-light relative bg-cream py-28 text-ink md:py-36">
      <div className="mx-auto max-w-[90rem] px-5 md:px-10">
        <header className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow text-copper-ink">The Royal Menu</p>
            <SplitHeading
              id="menu-title"
              lines={[["From the handi,"], [{ text: "the grill & the tawa.", italic: true, className: "text-copper" }]]}
              className="mt-5 font-serif text-headline font-light"
            />
          </div>
          <p className="max-w-lg leading-relaxed text-ink/70">
            Kebabs, slow curries, breads, desserts and chai — everything that belongs beside a biryani. Filter, search and
            add to your order in a couple of taps.
          </p>
        </header>

        {/* Filters */}
        <div className="relative z-30 -mx-5 mt-14 md:sticky md:top-20 border-y border-ink/10 bg-cream/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1" role="group" aria-label="Filter by category">
              {[{ id: "all" as const, name: "All" }, ...categories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-[0.78rem] font-semibold transition-colors",
                    category === c.id ? "border-ink bg-ink text-cream" : "border-ink/15 hover:border-ink/50"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-full border border-ink/15 p-1" role="group" aria-label="Filter by diet">
                {(
                  [
                    ["all", "All"],
                    ["veg", "Veg"],
                    ["nonveg", "Non-veg"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={diet === value}
                    onClick={() => setDiet(value)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.78rem] font-semibold transition-colors",
                      diet === value ? "bg-ink text-cream" : "hover:bg-ink/5"
                    )}
                  >
                    {value !== "all" && <DietMark isVeg={value === "veg"} className="h-3.5 w-3.5" />}
                    {label}
                  </button>
                ))}
              </div>
              <label className="relative flex w-full items-center sm:w-auto sm:min-w-56 sm:flex-1 2xl:w-72 2xl:flex-none">
                <span className="sr-only">Search dishes</span>
                <Search className="pointer-events-none absolute left-4 h-4 w-4 text-ink/50" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dishes…"
                  className="field-input min-h-11 rounded-full pl-11 pr-10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-ink/10"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
            </div>
          </div>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {summary}
        </p>

        {/* Results */}
        <div className="mt-12 min-h-[24rem]">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-dashed border-ink/20 px-6 py-20 text-center">
              <p className="font-serif text-3xl">Nothing matches that — yet.</p>
              <p className="max-w-sm text-ink/65">
                Try a different spelling, or clear the filters to see the full menu.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full bg-ink px-6 py-3 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-cream hover:bg-copper"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {groups.map((group) => (
                <motion.section
                  key={group.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  aria-labelledby={`cat-${group.id}`}
                  className="mb-16 last:mb-0"
                >
                  <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-4">
                    <h3 id={`cat-${group.id}`} className="font-serif text-4xl">
                      {group.name}
                    </h3>
                    <p className="hidden text-sm italic text-ink/60 sm:block">{group.blurb}</p>
                  </div>
                  <ul className="grid gap-x-10 xl:grid-cols-2">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {group.items.map((item) => (
                        <motion.li
                          key={item.id}
                          layout={!reduce}
                          initial={reduce ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={reduce ? undefined : { opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="border-b border-ink/10"
                        >
                          <MenuRow item={item} onOpen={() => setSelected(item)} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.section>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      <DishDialog item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function MenuRow({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  return (
    <article className={cn("flex gap-4 py-6 sm:gap-6", !item.available && "opacity-60")}>
      <button
        type="button"
        onClick={onOpen}
        data-cursor="View"
        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-ivory sm:h-32 sm:w-32"
        aria-label={`View ${item.name}`}
      >
        <Image
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="128px"
          className={cn(
            "object-cover transition-transform duration-700 group-hover:scale-110",
            !item.available && "grayscale"
          )}
        />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DietMark isVeg={item.isVeg} />
            <h4 className="font-serif text-2xl leading-tight">
              <button type="button" onClick={onOpen} className="text-left hover:text-copper-ink">
                {item.name}
              </button>
            </h4>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {item.badges.map((b) => (
              <BadgeTag key={b} badge={b} />
            ))}
            <SpiceLevel level={item.spice} className="text-copper-ink" />
            {!item.available && (
              <span className="rounded-full bg-ink/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em]">
                Unavailable today
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/70">{item.description}</p>
        </div>
        <AddToCart item={item} layout="compact" className="sm:w-56 sm:shrink-0" />
      </div>
    </article>
  );
}
