import Link from "next/link";
import { business } from "@/data/business";
import { cn } from "@/lib/utils";

/** Arch mark + wordmark. The arch nods to the pointed arches of Deccani architecture. */
export function ArchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={cn("h-8 w-auto", className)} aria-hidden="true" fill="none">
      <path
        d="M3 39V20C3 11 9.5 5.5 16 1c6.5 4.5 13 10 13 19v19"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 39V22c0-5 3-8.5 7-11 4 2.5 7 6 7 11v17" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <circle cx="16" cy="27" r="2.2" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label={`${business.name} — home`}>
      <ArchMark className="h-9 text-saffron transition-transform duration-700 group-hover:-translate-y-0.5" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.65rem] font-medium tracking-[0.08em]">{business.name}</span>
        <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.34em] opacity-70">
          {business.descriptor}
        </span>
      </span>
    </Link>
  );
}
