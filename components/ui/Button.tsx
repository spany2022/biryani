"use client";

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Variant = "gold" | "dark" | "outline" | "outline-light";

const variants: Record<Variant, string> = {
  gold: "bg-saffron text-midnight before:bg-cream",
  dark: "bg-midnight text-cream hover:text-midnight before:bg-saffron",
  outline: "border border-ink/30 text-ink hover:text-cream before:bg-ink",
  "outline-light": "border border-cream/35 text-cream hover:text-midnight before:bg-cream",
};

type Props = {
  variant?: Variant;
  magnetic?: boolean;
  icon?: ReactNode | false;
  children: ReactNode;
  className?: string;
} & (
  | ({ href: string } & Omit<ComponentPropsWithoutRef<"a">, "className" | "children">)
  | ({ href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">)
);

/**
 * Pill button with a fill-from-below hover, a subtle magnetic pull on fine
 * pointers, and a clear focus ring. Purpose is always visible without hover.
 */
export default function Button({ variant = "gold", magnetic = true, icon, children, className, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !magnetic) return;
      const mm = gsap.matchMedia();
      mm.add(`${motionQueries.finePointer} and ${motionQueries.motion}`, () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { dependencies: [magnetic] }
  );

  const classes = cn(
    "group relative isolate inline-flex whitespace-nowrap min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "before:absolute before:inset-0 before:-z-10 before:translate-y-[101%] before:rounded-full before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:translate-y-0 focus-visible:before:translate-y-0",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:before:hidden",
    variants[variant],
    className
  );

  const iconNode =
    icon === false ? null : (
      <span aria-hidden="true" className="relative inline-flex h-4 w-4 overflow-hidden">
        {icon ?? (
          <>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-4 group-hover:translate-x-4" strokeWidth={1.75} />
            <ArrowUpRight className="absolute inset-0 h-4 w-4 -translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0" strokeWidth={1.75} />
          </>
        )}
      </span>
    );

  if (rest.href !== undefined) {
    const { href, ...anchorProps } = rest as { href: string } & ComponentPropsWithoutRef<"a">;
    const external = /^https?:/.test(href);
    if (href.startsWith("/")) {
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes} {...anchorProps}>
          <span>{children}</span>
          {iconNode}
        </Link>
      );
    }
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...anchorProps}
      >
        <span>{children}</span>
        {iconNode}
      </a>
    );
  }

  const buttonProps = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={classes} {...buttonProps}>
      <span>{children}</span>
      {iconNode}
    </button>
  );
}
