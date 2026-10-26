"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import SplitHeading from "@/components/ui/SplitHeading";
import { business } from "@/data/business";
import { rating, reviews } from "@/data/reviews";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

/**
 * Only verified reviews are shown. The carousel never auto-plays; visitors move it
 * themselves with buttons, swipe or keyboard.
 */
export default function Reviews() {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
  };

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="on-dark relative overflow-hidden bg-charcoal py-28 text-cream md:py-36">
      <div className="grain" aria-hidden="true" />
      <div className="relative mx-auto max-w-[90rem] px-5 md:px-10">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-saffron">Customer Love</p>
            <SplitHeading
              id="reviews-title"
              lines={[["Stories Shared"], [{ text: "Over Biryani.", italic: true, className: "text-saffron" }]]}
              className="mt-5 font-serif text-headline font-light"
            />
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            {rating && (
              <p className="flex items-center gap-3">
                <span className="font-serif text-5xl">{rating.value.toFixed(1)}</span>
                <span className="flex flex-col text-sm text-cream/65">
                  <span className="flex text-saffron" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < Math.round(rating!.value) && "fill-current")} />
                    ))}
                  </span>
                  {rating.count.toLocaleString("en-IN")} reviews on {rating.source} · as of{" "}
                  {dateFormat.format(new Date(rating.asOf))}
                </span>
              </p>
            )}
            {business.googleProfileUrl && (
              <Button href={business.googleProfileUrl} variant="outline-light">
                Read more reviews on Google
              </Button>
            )}
          </div>
        </header>

        {reviews.length === 0 ? (
          <div className="mt-16 grid gap-10 rounded-[2rem] border border-cream/12 bg-midnight/40 p-8 md:grid-cols-[auto_1fr] md:items-center md:p-14">
            <span aria-hidden="true" className="font-serif text-[9rem] leading-[0.6] text-saffron/40">
              &ldquo;
            </span>
            <div className="max-w-2xl">
              <p className="font-serif text-3xl leading-snug md:text-4xl">
                We&apos;d rather show you real words from real guests than invent them.
              </p>
              <p className="mt-5 leading-relaxed text-cream/65">
                Verified reviews from our Google Business Profile will appear here
                {business.googleProfileUrl ? " — until then, you can read them on Google directly." : " once our profile is connected."}{" "}
                Visited us? We&apos;d love to hear how the biryani was.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ul
              ref={track}
              onScroll={onScroll}
              className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
              aria-label="Guest reviews"
              tabIndex={0}
            >
              {reviews.map((r) => (
                <li key={`${r.author}-${r.date}`} className="w-[85%] shrink-0 snap-start sm:w-[24rem]">
                  <figure className="flex h-full flex-col rounded-[1.75rem] border border-cream/12 bg-midnight/50 p-8">
                    {r.rating && (
                      <p className="flex text-saffron" aria-label={`${r.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} aria-hidden="true" className={cn("h-4 w-4", i < r.rating! && "fill-current")} />
                        ))}
                      </p>
                    )}
                    <blockquote className="mt-5 flex-1 font-serif text-2xl leading-snug">“{r.quote}”</blockquote>
                    {r.photo && (
                      <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-xl">
                        <Image src={r.photo.src} alt={r.photo.alt} fill sizes="24rem" className="object-cover" />
                      </div>
                    )}
                    <figcaption className="mt-6 text-sm text-cream/65">
                      <span className="font-semibold text-cream">{r.author}</span> · {r.source} ·{" "}
                      <time dateTime={r.date}>{dateFormat.format(new Date(r.date))}</time>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={atStart}
                aria-label="Previous reviews"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cream/25 transition-colors hover:bg-cream hover:text-midnight disabled:opacity-30"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={atEnd}
                aria-label="Next reviews"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cream/25 transition-colors hover:bg-cream hover:text-midnight disabled:opacity-30"
              >
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
