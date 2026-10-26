import type { Badge, MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The standard Indian veg / non-veg mark: a square outline with a dot or triangle. */
export function DietMark({ isVeg, className }: { isVeg: boolean; className?: string }) {
  const color = isVeg ? "var(--color-veg)" : "var(--color-nonveg)";
  return (
    <span
      className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] bg-cream", className)}
      style={{ borderColor: color }}
      role="img"
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      {isVeg ? (
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      ) : (
        <svg viewBox="0 0 10 9" className="h-2 w-2" aria-hidden="true">
          <path d="M5 0l5 9H0z" fill={color} />
        </svg>
      )}
    </span>
  );
}

const spiceWords = ["Mild", "Medium", "Spicy", "Hot"] as const;

export function SpiceLevel({ level, className }: { level: MenuItem["spice"]; className?: string }) {
  if (level === null) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} title={`Spice: ${spiceWords[level]}`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <svg key={n} viewBox="0 0 12 16" className={cn("h-3 w-2.5", n <= level ? "opacity-100" : "opacity-25")}>
            <path
              d="M7.2 1.2c.3 1-.1 1.8-.8 2.3 2.9.6 4.6 3.2 4.1 6.5-.5 3.4-3.5 5.7-6.7 4.9C1.6 14.2.3 11.7 1 9c.5-2 2-3.7 3.9-4.6-.1-1.2.5-2.5 2.3-3.2z"
              fill="currentColor"
            />
          </svg>
        ))}
      </span>
      <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em]">{spiceWords[level]}</span>
    </span>
  );
}

const badgeText: Record<Badge, string> = {
  bestseller: "Bestseller",
  "chef-special": "Chef's Special",
  new: "New",
};

export function BadgeTag({ badge, className }: { badge: Badge; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-saffron px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-midnight",
        className
      )}
    >
      {badgeText[badge]}
    </span>
  );
}
