"use client";

import { useId, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/money";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  item: MenuItem;
  tone?: "light" | "dark";
  /** "full" shows portion chips; "compact" uses a select to save space. */
  layout?: "full" | "compact";
  className?: string;
};

export function QtyStepper({
  qty,
  onChange,
  label,
  tone = "light",
  size = "md",
}: {
  qty: number;
  onChange: (qty: number) => void;
  label: string;
  tone?: "light" | "dark";
  size?: "sm" | "md";
}) {
  const btn = cn(
    "inline-flex items-center justify-center rounded-full transition-colors",
    size === "md" ? "h-11 w-11" : "h-9 w-9",
    tone === "light" ? "hover:bg-ink/10" : "hover:bg-cream/10"
  );
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border",
        tone === "light" ? "border-ink/20" : "border-cream/25"
      )}
      role="group"
      aria-label={`Quantity of ${label}`}
    >
      <button type="button" className={btn} onClick={() => onChange(qty - 1)} aria-label={`Remove one ${label}`}>
        <Minus className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <span className="min-w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button type="button" className={btn} onClick={() => onChange(qty + 1)} aria-label={`Add one more ${label}`}>
        <Plus className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/**
 * Portion picker + add button. Once a portion is in the cart the button turns
 * into a quantity stepper, so the visitor always sees what they've ordered.
 */
export default function AddToCart({ item, tone = "light", layout = "full", className }: Props) {
  const { add, lines, setQty } = useCart();
  const [portionId, setPortionId] = useState(item.portions[0]?.id ?? "");
  const groupId = useId();
  const portion = item.portions.find((p) => p.id === portionId) ?? item.portions[0];
  const inCart = lines.find((l) => l.itemId === item.id && l.portionId === portion?.id);

  if (!portion) return null;

  if (!item.available) {
    return (
      <p className={cn("text-sm font-medium opacity-70", className)}>
        Unavailable right now
      </p>
    );
  }

  const label = item.portions.length > 1 ? `${item.name}, ${portion.label}` : item.name;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {item.portions.length > 1 &&
        (layout === "full" ? (
          <fieldset>
            <legend className="sr-only">Choose a portion of {item.name}</legend>
            <div className="flex flex-wrap gap-2">
              {item.portions.map((p) => {
                const active = p.id === portion.id;
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "relative cursor-pointer rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-saffron",
                      active
                        ? tone === "light"
                          ? "border-ink bg-ink text-cream"
                          : "border-saffron bg-saffron text-midnight"
                        : tone === "light"
                          ? "border-ink/20 hover:border-ink/50"
                          : "border-cream/25 hover:border-cream/60"
                    )}
                  >
                    <input
                      type="radio"
                      name={groupId}
                      value={p.id}
                      checked={active}
                      onChange={() => setPortionId(p.id)}
                      className="sr-only"
                    />
                    {p.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <label className="block">
            <span className="sr-only">Portion of {item.name}</span>
            <select
              value={portion.id}
              onChange={(e) => setPortionId(e.target.value)}
              className="field-input min-h-11 py-2 text-sm"
            >
              {item.portions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.serves ? ` · ${p.serves}` : ""} — {formatPrice(p.price)}
                </option>
              ))}
            </select>
          </label>
        ))}

      <div className="flex items-center justify-between gap-4">
        <span className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-medium tabular-nums">{formatPrice(portion.price)}</span>
          {portion.serves && layout === "full" && (
            <span className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] opacity-60">{portion.serves}</span>
          )}
        </span>
        {inCart ? (
          <QtyStepper
            qty={inCart.qty}
            onChange={(q) => setQty(item.id, portion.id, q)}
            label={label}
            tone={tone}
          />
        ) : (
          <button
            type="button"
            onClick={() => add(item.id, portion.id)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[0.72rem] font-bold uppercase tracking-[0.16em] transition-colors",
              tone === "light"
                ? "bg-ink text-cream hover:bg-copper"
                : "bg-saffron text-midnight hover:bg-cream"
            )}
            aria-label={`Add ${label} to order`}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Add
          </button>
        )}
      </div>
    </div>
  );
}
