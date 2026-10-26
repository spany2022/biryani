"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { QtyStepper } from "@/components/cart/AddToCart";
import { DietMark } from "@/components/ui/DishMeta";
import { formatPrice } from "@/lib/money";
import { lockScroll } from "@/lib/scroll";
import { business } from "@/data/business";

export default function CartDrawer() {
  const { view, count, subtotal, isOpen, close, setQty, remove, ready } = useCart();
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      lockScroll(true);
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Close when navigating (e.g. to checkout).
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const hasProblems = view.some((l) => !l.ok);

  return (
    <dialog
      ref={ref}
      className="panel drawer on-light"
      aria-labelledby="cart-title"
      onClose={() => {
        lockScroll(false);
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="flex h-full flex-col bg-cream text-ink shadow-2xl">
        <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <p className="eyebrow text-copper-ink">Your order</p>
            <h2 id="cart-title" className="mt-1 font-serif text-3xl">
              {count === 0 ? "Your cart is empty" : `${count} ${count === 1 ? "item" : "items"}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-cream"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        {!ready ? (
          <div className="flex flex-1 items-center justify-center" aria-busy="true">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-copper" />
          </div>
        ) : view.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ivory">
              <ShoppingBag className="h-8 w-8 text-copper-ink" strokeWidth={1.25} aria-hidden="true" />
            </span>
            <p className="max-w-xs text-ink/70">
              Nothing here yet. Start with a signature dum biryani — the rest of the feast will follow.
            </p>
            <Link
              href="/#signature"
              onClick={close}
              className="rounded-full bg-ink px-6 py-3 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-copper"
            >
              Browse signature biryani
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto overscroll-contain px-6">
              {view.map((line) => {
                const name = line.item?.name ?? "Item no longer available";
                const label = line.portionLabel ? `${name}, ${line.portionLabel}` : name;
                return (
                  <li key={`${line.itemId}:${line.portionId}`} className="flex gap-4 py-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ivory">
                      {line.item && (
                        <Image src={line.item.image} alt="" fill sizes="80px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-semibold leading-snug">
                            {line.item && <DietMark isVeg={line.item.isVeg} />}
                            <span className="truncate">{name}</span>
                          </p>
                          {line.portionLabel && line.item && line.item.portions.length > 1 && (
                            <p className="text-sm text-ink/60">{line.portionLabel}</p>
                          )}
                        </div>
                        <p className="shrink-0 font-semibold tabular-nums">{formatPrice(line.lineTotal)}</p>
                      </div>
                      {!line.ok && (
                        <p className="flex items-center gap-1.5 text-sm text-nonveg">
                          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                          Unavailable — please remove it to continue.
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {line.ok ? (
                          <QtyStepper
                            qty={line.qty}
                            size="sm"
                            label={label}
                            onChange={(q) => setQty(line.itemId, line.portionId, q)}
                          />
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          onClick={() => remove(line.itemId, line.portionId)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                          Remove<span className="sr-only"> {label}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-ink/10 bg-ivory/50 px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-[0.16em] text-ink/70">Subtotal</span>
                <span className="font-serif text-3xl tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-ink/60">
                Taxes{business.services.delivery ? ", delivery fee" : ""} and offers are calculated at checkout.
              </p>
              {hasProblems ? (
                <p className="mt-5 rounded-xl bg-nonveg/10 px-4 py-3 text-sm text-nonveg">
                  Remove unavailable items to continue to checkout.
                </p>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-5 flex min-h-13 w-full items-center justify-center rounded-full bg-ink text-[0.8rem] font-bold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-copper"
                >
                  Checkout · {formatPrice(subtotal)}
                </Link>
              )}
              <button
                type="button"
                onClick={close}
                className="mt-3 w-full text-center text-sm text-ink/70 underline-offset-4 hover:underline"
              >
                Continue browsing
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
