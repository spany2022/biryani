"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Info, RefreshCw, XCircle } from "lucide-react";
import { business, telHref } from "@/data/business";
import { ordering } from "@/data/ordering";
import { formatPrice } from "@/lib/money";
import type { OrderStatus as Status, PublicOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_MS = 15_000;

const stepsFor = (fulfilment: PublicOrder["fulfilment"]): { status: Status; label: string; note: string }[] => [
  { status: "received", label: "Order received", note: "We've got your order." },
  { status: "confirmed", label: "Confirmed", note: "The kitchen has accepted it." },
  { status: "preparing", label: "On the dum", note: "Your biryani is being prepared." },
  fulfilment === "delivery"
    ? { status: "out-for-delivery", label: "Out for delivery", note: "On its way to you." }
    : { status: "ready", label: "Ready for pickup", note: "Packed and waiting at the counter." },
  { status: "completed", label: fulfilment === "delivery" ? "Delivered" : "Collected", note: "Enjoy your feast." },
];

const timeFormat = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" });

export default function OrderStatus({ initial, token }: { initial: PublicOrder; token: string }) {
  const [order, setOrder] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}?t=${encodeURIComponent(token)}`, { cache: "no-store" });
      if (res.ok) setOrder(((await res.json()) as { order: PublicOrder }).order);
      setLastChecked(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  const done = order.status === "completed" || order.status === "cancelled";
  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const steps = stepsFor(order.fulfilment);
  // "ready" counts as reached for delivery orders that skipped straight to out-for-delivery, and vice versa.
  const rank = (s: Status) => {
    if (s === "ready" || s === "out-for-delivery") return 3;
    return ["received", "confirmed", "preparing", "", "completed"].indexOf(s);
  };
  const current = rank(order.status);
  const q = order.quote;

  return (
    <div className="mx-auto grid max-w-[72rem] gap-12 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="eyebrow text-copper-ink">Order {order.id}</p>
        <h1 className="mt-4 font-serif text-headline font-light">
          {order.status === "cancelled" ? "Order cancelled" : `Thank you, ${order.customer.name.split(" ")[0]}.`}
        </h1>
        <p className="mt-5 max-w-lg text-lg text-ink/70">
          {order.status === "cancelled"
            ? `This order was cancelled. ${business.phone ? `Call us on ${business.phone} if you have questions.` : ""}`
            : order.fulfilment === "delivery"
              ? `We'll deliver to ${order.address?.line1}, ${order.address?.pincode}. Estimated ${ordering.delivery.estimate}.`
              : `Pick up from the restaurant in about ${ordering.pickup.estimate}.`}
        </p>

        {order.demo && (
          <p className="mt-6 flex items-start gap-3 rounded-2xl border border-copper/30 bg-copper/10 px-5 py-4 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-copper-ink" aria-hidden="true" />
            <span>
              <strong>Demo order.</strong> Nothing will be cooked or delivered. Change its status from the admin dashboard to see
              this page update.
            </span>
          </p>
        )}

        {order.status === "cancelled" ? (
          <p className="mt-10 flex items-center gap-3 text-nonveg">
            <XCircle className="h-6 w-6" aria-hidden="true" /> Cancelled
          </p>
        ) : (
          <ol className="mt-12 space-y-0" aria-label="Order progress">
            {steps.map((step, i) => {
              const reached = current >= i;
              const isCurrent = current === i;
              const at = order.history.findLast?.((h) => rank(h.status) === i)?.at;
              return (
                <li key={step.status} className="relative flex gap-5 pb-8 last:pb-0" aria-current={isCurrent ? "step" : undefined}>
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={cn("absolute left-[1.05rem] top-9 h-[calc(100%-2.25rem)] w-px", current > i ? "bg-copper" : "bg-ink/15")}
                    />
                  )}
                  <span
                    className={cn(
                      "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm",
                      reached ? "border-copper bg-copper text-cream" : "border-ink/20 text-ink/40",
                      isCurrent && !done && "ring-4 ring-copper/20"
                    )}
                  >
                    {reached ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </span>
                  <div className="pt-1">
                    <p className={cn("font-semibold", !reached && "text-ink/50")}>
                      {step.label}
                      <span className="sr-only">{reached ? " — done" : " — pending"}</span>
                    </p>
                    <p className="text-sm text-ink/60">
                      {step.note}
                      {at && reached && <span className="ml-2 tabular-nums">· {timeFormat.format(new Date(at))}</span>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-ink/60">
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden="true" />
            Refresh status
          </button>
          {!done && <span>Updates automatically every 15 seconds{lastChecked ? ` · last checked ${timeFormat.format(lastChecked)}` : ""}.</span>}
        </div>
        <p className="mt-4 text-sm text-ink/60">Bookmark this page to check your order later.</p>
        {business.phone && (
          <p className="mt-2 text-sm">
            Questions? <a href={telHref(business.phone)} className="font-semibold underline">Call {business.phone}</a>
          </p>
        )}
      </div>

      <aside className="self-start rounded-[1.75rem] border border-ink/10 bg-ivory/60 p-6 md:p-8" aria-labelledby="receipt-title">
        <h2 id="receipt-title" className="font-serif text-3xl">
          Your order
        </h2>
        <ul className="mt-5 divide-y divide-ink/10 text-sm">
          {q.lines.map((l) => (
            <li key={`${l.itemId}:${l.portionId}`} className="flex justify-between gap-4 py-3">
              <span>
                {l.qty} × {l.name}
                {l.portionLabel && <span className="text-ink/60"> ({l.portionLabel})</span>}
              </span>
              <span className="tabular-nums">{formatPrice(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(q.subtotal)}</dd>
          </div>
          {q.discount > 0 && (
            <div className="flex justify-between text-veg">
              <dt>Discount ({q.promo?.code})</dt>
              <dd className="tabular-nums">−{formatPrice(q.discount)}</dd>
            </div>
          )}
          {order.fulfilment === "delivery" && (
            <div className="flex justify-between">
              <dt>Delivery fee</dt>
              <dd className="tabular-nums">{q.deliveryFee === 0 ? "Free" : formatPrice(q.deliveryFee)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>{q.taxLabel}</dt>
            <dd className="tabular-nums">{formatPrice(q.tax)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
            <dt className="font-semibold uppercase tracking-[0.14em]">Total</dt>
            <dd className="font-serif text-3xl tabular-nums">{formatPrice(q.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-ink/65">
          {order.payment.method === "pay-on-delivery" ? "Pay on delivery" : "Pay at the counter"} · {order.payment.status === "paid" ? "Paid" : "Not yet paid"}
        </p>
        <Link
          href="/#menu"
          className="mt-6 flex min-h-12 items-center justify-center rounded-full border border-ink/25 text-[0.75rem] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-cream"
        >
          Back to the menu
        </Link>
      </aside>
    </div>
  );
}
