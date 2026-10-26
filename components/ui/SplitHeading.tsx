"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type Segment = string | { text: string; italic?: boolean; className?: string };
export type SplitLines = Segment[][];

type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  lines: SplitLines;
  className?: string;
  id?: string;
  /**
   * "scroll" animates when the heading enters the viewport.
   * "manual" renders the split markup with `data-hero-word` hooks so a parent
   * timeline can choreograph it (used by the hero).
   */
  trigger?: "scroll" | "manual";
  delay?: number;
};

const segText = (s: Segment) => (typeof s === "string" ? s : s.text);

export const linesToText = (lines: SplitLines) =>
  lines.map((line) => line.map(segText).join(" ")).join(" ");

/**
 * Word-by-word masked headline reveal.
 *
 * The split is rendered by React (no DOM mutation after hydration, no layout
 * shift). Screen readers get one clean sentence from a visually-hidden copy;
 * the animated words are aria-hidden so nothing is announced twice.
 */
export default function SplitHeading({ as = "h2", lines, className, id, trigger = "scroll", delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (trigger !== "scroll" || !ref.current) return;
      const mm = gsap.matchMedia();
      mm.add(motionQueries.motion, () => {
        const words = ref.current!.querySelectorAll(".split-word");
        gsap.from(words, {
          yPercent: 115,
          rotate: 4,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.06,
          delay,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  let wordIndex = 0;
  const content: ReactNode = (
    <>
      <span className="sr-only">{linesToText(lines)}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <span key={li} className="split-line">
            {line.flatMap((seg, si) => {
              const text = segText(seg);
              const italic = typeof seg !== "string" && seg.italic;
              const extra = typeof seg !== "string" ? seg.className : undefined;
              return text.split(" ").filter(Boolean).map((word, wi) => {
                const i = wordIndex++;
                return (
                  <span key={`${si}-${wi}`}>
                    <span className="split-mask">
                      <span
                        className={cn("split-word", italic && "font-light italic", extra)}
                        data-hero-word={trigger === "manual" ? i : undefined}
                        style={trigger === "manual" ? ({ "--i": i } as React.CSSProperties) : undefined}
                      >
                        {word}
                      </span>
                    </span>{" "}
                  </span>
                );
              });
            })}
          </span>
        ))}
      </span>
    </>
  );

  const Tag = as;
  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement & HTMLParagraphElement>} id={id} className={className}>
      {content}
    </Tag>
  );
}
