"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Bike, Check, Info, Loader2, ShoppingBag, Store, Tag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { QtyStepper } from "@/components/cart/AddToCart";
import { DietMark } from "@/components/ui/DishMeta";
import Field from "@/components/ui/Field";
import { business } from "@/data/business";
import { ordering } from "@/data/ordering";
import { formatPrice } from "@/lib/money";
import { formValues, postJson } from "@/lib/submit";
import type { FieldErrors, Fulfilment, Quote } from "@/lib/types";
import { cn } from "@/lib/utils";

const DETAILS_KEY = "noor-checkout-details";

type QuoteState = { status: "idle" | "loading" | "ready" | "error"; quote: Quote | null; message?: string };

export default function Checkout() {
  const router = useRouter();
  const { view, lines, ready, setQty, remove, clear } = useCart();
  const formRef = useRef<HTMLFormElement>(null);
  const defaultFulfilment: Fulfilment = business.services.delivery ? "delivery" : "pickup";
  const [fulfilment, setFulfilment] = useState<Fulfilment>(defaultFulfilment);
  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [quote, setQuote] = useState<QuoteState>({ status: "idle", quote: null });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Restore contact details from a previous order on this device.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(DETAILS_KEY) ?? "null") as Record<string, string> | null;
      const form = formRef.current;
      if (!saved || !form) return;
      for (const [k, v] of Object.entries(saved)) {
        const el = form.elements.namedItem(k);
        if (el instanceof HTMLInputElement && !el.value) el.value = v;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved.pincode) setPincode(saved.pincode);
    } catch {
      // ignore
    }
  }, [ready]);

  const fetchQuote = useCallback(async () => {
    if (lines.length === 0) return;
    setQuote((q) => ({ ...q, status: "loading" }));
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          fulfilment,
          pincode: fulfilment === "delivery" ? checkedPincode : undefined,
          promoCode: promoCode || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { quote: Quote };
      setQuote({ status: "ready", quote: data.quote });
    } catch {
      setQuote((q) => ({ ...q, status: "error", message: "We couldn't calculate your total. Please try again." }));
    }
  }, [lines, fulfilment, checkedPincode, promoCode]);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(fetchQuote, 250);
    return () => window.clearTimeout(t);
  }, [ready, fetchQuote]);

  const q = quote.quote;

  const checkPincode = () => {
    const value = pincode.trim();
    if (!/^\d{6}$/.test(value)) {
      setErrors((e) => ({ ...e, pincode: "Enter a 6-digit pincode." }));
      return;
    }
    setErrors((e) => {
      const next = { ...e };
      delete next.pincode;
      return next;
    });
    setCheckedPincode(value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const v = formValues(form);
    setSubmitError("");

    // Quick client-side checks; the server validates everything again.
    const next: FieldErrors = {};
    if (v.name.length < 2) next.name = "Please enter your name.";
    if (!/^[6-9]\d{9}$/.test(v.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "")))
      next.phone = "Enter a valid 10-digit mobile number.";
    if (fulfilment === "delivery") {
      if (v.line1.length < 5) next.line1 = "Please enter your house / flat and street.";
      if (!/^\d{6}$/.test(pincode.trim())) next.pincode = "Enter a 6-digit pincode.";
      else if (checkedPincode !== pincode.trim()) next.pincode = "Check delivery availability for this pincode.";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      (form.elements.namedItem(Object.keys(next)[0]) as HTMLElement | null)?.focus();
      return;
    }

    setSubmitting(true);
    const res = await postJson<{ id: string; token: string }>("/api/orders", {
      cart: { lines, fulfilment, pincode: fulfilment === "delivery" ? pincode.trim() : undefined, promoCode: promoCode || undefined },
      customer: { name: v.name, phone: v.phone, email: v.email },
      address: fulfilment === "delivery" ? { line1: v.line1, line2: v.line2, landmark: v.landmark } : undefined,
      notes: v.notes,
    });

    if (res.ok) {
      try {
        window.localStorage.setItem(
          DETAILS_KEY,
          JSON.stringify({ name: v.name, phone: v.phone, email: v.email, line1: v.line1, line2: v.line2, landmark: v.landmark, pincode })
        );
      } catch {
        // ignore
      }
      clear();
      router.push(`/order/${res.data.id}?t=${res.data.token}`);
      return;
    }

    setSubmitting(false);
    setErrors(res.errors ?? {});
    setSubmitError(res.message);
    const data = res.data as { quote?: Quote } | undefined;
    if (data?.quote) setQuote({ status: "ready", quote: data.quote });
  };

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
        <Loader2 className="h-8 w-8 animate-spin text-copper" aria-label="Loading your order" />
      </div>
    );
  }

  if (view.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ivory">
          <ShoppingBag className="h-8 w-8 text-copper-ink" strokeWidth={1.25} aria-hidden="true" />
        </span>
        <h1 className="font-serif text-5xl">Your cart is empty</h1>
        <p className="text-ink/70">Add a biryani or two, then come back to check out.</p>
        <Link
          href="/#signature"
          className="rounded-full bg-ink px-7 py-3.5 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-cream hover:bg-copper"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  const deliveryReady = fulfilment === "pickup" || q?.delivery.available === true;

  return (
    <div className="mx-auto max-w-[80rem]">
      <Link href="/#menu" className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to menu
      </Link>
      <h1 className="mt-6 font-serif text-headline font-light">Checkout</h1>

      {ordering.mode === "demo" && (
        <p className="mt-6 flex items-start gap-3 rounded-2xl border border-copper/30 bg-copper/10 px-5 py-4 text-sm text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-copper-ink" aria-hidden="true" />
          <span>
            <strong>Demo mode.</strong> Orders are saved to this demo&apos;s local store so you can follow them in the admin
            dashboard. No payment is taken and no food will be prepared or delivered.
          </span>
        </p>
      )}

      <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-10">
          {/* 1. Fulfilment */}
          <fieldset>
            <legend className="font-serif text-3xl">1. Delivery or pickup</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: "delivery", label: "Delivery", note: `About ${ordering.delivery.estimate}`, icon: Bike, enabled: business.services.delivery },
                  { value: "pickup", label: "Pickup", note: `Ready in ${ordering.pickup.estimate}`, icon: Store, enabled: business.services.pickup },
                ] as const
              )
                .filter((o) => o.enabled)
                .map(({ value, label, note, icon: Icon }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-copper-ink",
                      fulfilment === value ? "border-ink bg-ink text-cream" : "border-ink/15 hover:border-ink/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="fulfilment"
                      value={value}
                      checked={fulfilment === value}
                      onChange={() => setFulfilment(value)}
                      className="sr-only"
                    />
                    <Icon className="h-6 w-6 shrink-0" strokeWidth={1.4} aria-hidden="true" />
                    <span>
                      <span className="block font-semibold">{label}</span>
                      <span className="text-sm opacity-70">{note}</span>
                    </span>
                    {fulfilment === value && <Check className="ml-auto h-5 w-5" aria-hidden="true" />}
                  </label>
                ))}
            </div>
          </fieldset>

          {/* 2. Address */}
          {fulfilment === "delivery" ? (
            <fieldset className="grid gap-5 sm:grid-cols-2">
              <legend className="mb-5 font-serif text-3xl">2. Delivery address</legend>
              <Field label="Pincode" error={errors.pincode} className="sm:col-span-2" hint="We'll check that we deliver to you.">
                {(p) => (
                  <div className="flex gap-3">
                    <input
                      {...p}
                      name="pincode"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          checkPincode();
                        }
                      }}
                      className="field-input max-w-[12rem]"
                    />
                    <button
                      type="button"
                      onClick={checkPincode}
                      className="rounded-full border border-ink/25 px-5 text-[0.75rem] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-cream"
                    >
                      Check
                    </button>
                  </div>
                )}
              </Field>
              {q?.delivery.message && checkedPincode && (
                <p
                  role="status"
                  className={cn(
                    "-mt-2 flex items-center gap-2 text-sm sm:col-span-2",
                    q.delivery.available ? "text-veg" : "text-nonveg"
                  )}
                >
                  {q.delivery.available ? <Check className="h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
                  {q.delivery.message}
                </p>
              )}
              <Field label="House / flat, street" error={errors.line1} className="sm:col-span-2">
                {(p) => <input {...p} name="line1" autoComplete="address-line1" className="field-input" />}
              </Field>
              <Field label="Area / locality" optional>
                {(p) => <input {...p} name="line2" autoComplete="address-line2" className="field-input" />}
              </Field>
              <Field label="Landmark" optional>
                {(p) => <input {...p} name="landmark" className="field-input" />}
              </Field>
            </fieldset>
          ) : (
            <div>
              <h2 className="font-serif text-3xl">2. Pickup</h2>
              <p className="mt-4 text-ink/75">
                Collect from{" "}
                {business.address ? (
                  <strong>
                    {business.address.street}, {business.address.locality}
                  </strong>
                ) : (
                  <span>the restaurant (address to be announced)</span>
                )}
                . We&apos;ll have your order packed and ready in about {ordering.pickup.estimate}.
              </p>
            </div>
          )}

          {/* 3. Contact */}
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-5 font-serif text-3xl">3. Your details</legend>
            <Field label="Name" error={errors.name}>
              {(p) => <input {...p} name="name" autoComplete="name" className="field-input" />}
            </Field>
            <Field label="Mobile number" error={errors.phone} hint="For order updates only.">
              {(p) => <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className="field-input" />}
            </Field>
            <Field label="Email" optional error={errors.email} className="sm:col-span-2">
              {(p) => <input {...p} name="email" type="email" autoComplete="email" className="field-input" />}
            </Field>
            <Field label="Cooking or delivery instructions" optional className="sm:col-span-2">
              {(p) => <textarea {...p} name="notes" rows={3} maxLength={500} placeholder="Less spicy, ring the bell twice…" className="field-input resize-y" />}
            </Field>
          </fieldset>

          {/* 4. Payment */}
          <fieldset>
            <legend className="font-serif text-3xl">4. Payment</legend>
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-ink bg-ink p-5 text-cream">
              <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <span className="block font-semibold">
                  {fulfilment === "delivery" ? "Pay on delivery" : "Pay at the counter"}
                </span>
                <span className="text-sm opacity-70">Cash or UPI when you receive your order.</span>
              </span>
            </div>
            {!ordering.onlinePayments && (
              <p className="mt-3 text-sm text-ink/60">Online payment isn&apos;t set up yet.</p>
            )}
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start" aria-labelledby="summary-title">
          <div className="rounded-[1.75rem] border border-ink/10 bg-ivory/60 p-6 md:p-8">
            <h2 id="summary-title" className="font-serif text-3xl">
              Order summary
            </h2>
            <ul className="mt-6 divide-y divide-ink/10">
              {view.map((l) => {
                const problem = q?.problems.find((p) => p.itemId === l.itemId && p.portionId === l.portionId);
                const name = l.item?.name ?? "Unavailable item";
                return (
                  <li key={`${l.itemId}:${l.portionId}`} className="flex gap-4 py-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ivory">
                      {l.item && <Image src={l.item.image} alt="" fill sizes="56px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <p className="flex items-center gap-2 font-semibold leading-snug">
                          {l.item && <DietMark isVeg={l.item.isVeg} className="h-3.5 w-3.5" />}
                          <span>{name}</span>
                        </p>
                        <span className="shrink-0 tabular-nums">{formatPrice(l.lineTotal)}</span>
                      </div>
                      {l.item && l.item.portions.length > 1 && <p className="text-sm text-ink/60">{l.portionLabel}</p>}
                      {problem ? (
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-sm text-nonveg">{problem.message}</p>
                          <button type="button" onClick={() => remove(l.itemId, l.portionId)} className="text-sm font-semibold underline">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <QtyStepper
                            qty={l.qty}
                            size="sm"
                            label={l.portionLabel ? `${name}, ${l.portionLabel}` : name}
                            onChange={(n) => setQty(l.itemId, l.portionId, n)}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Promo */}
            <div className="mt-4 border-t border-ink/10 pt-5">
              <label htmlFor="promo" className="flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] opacity-80">
                <Tag className="h-4 w-4" aria-hidden="true" /> Offer code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="promo"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setPromoCode(promoInput.trim());
                    }
                  }}
                  className="field-input min-h-11 uppercase"
                  aria-describedby="promo-status"
                  placeholder={ordering.mode === "demo" ? "Try DEMO10" : undefined}
                />
                {promoCode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPromoCode("");
                      setPromoInput("");
                    }}
                    className="rounded-full border border-ink/25 px-4 text-sm font-semibold"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPromoCode(promoInput.trim())}
                    disabled={!promoInput.trim()}
                    className="rounded-full border border-ink/25 px-4 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream disabled:opacity-40"
                  >
                    Apply
                  </button>
                )}
              </div>
              <p id="promo-status" role="status" className="mt-2 min-h-5 text-sm">
                {q?.promoError ? (
                  <span className="text-nonveg">{q.promoError}</span>
                ) : q?.promo ? (
                  <span className="text-veg">{q.promo.label} applied.</span>
                ) : null}
              </p>
            </div>

            {/* Totals */}
            <dl className="mt-2 space-y-2 border-t border-ink/10 pt-5 text-sm" aria-live="polite" aria-busy={quote.status === "loading"}>
              {q ? (
                <>
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
                  {fulfilment === "delivery" && (
                    <div className="flex justify-between">
                      <dt>Delivery fee</dt>
                      <dd className="tabular-nums">{q.deliveryFee === 0 ? "Free" : formatPrice(q.deliveryFee)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>{q.taxLabel}</dt>
                    <dd className="tabular-nums">{formatPrice(q.tax)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-ink/10 pt-4">
                    <dt className="font-semibold uppercase tracking-[0.14em]">Total</dt>
                    <dd className={cn("font-serif text-4xl tabular-nums transition-opacity", quote.status === "loading" && "opacity-50")}>
                      {formatPrice(q.total)}
                    </dd>
                  </div>
                  {fulfilment === "delivery" && q.deliveryFee > 0 && (
                    <p className="text-xs text-ink/60">Free delivery on orders over {formatPrice(ordering.delivery.freeAbove)}.</p>
                  )}
                </>
              ) : quote.status === "error" ? (
                <p className="text-nonveg">{quote.message}</p>
              ) : (
                <p className="flex items-center gap-2 text-ink/60">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Calculating…
                </p>
              )}
            </dl>

            {quote.status === "error" && (
              <button type="button" onClick={fetchQuote} className="mt-3 text-sm font-semibold underline">
                Try again
              </button>
            )}

            {/* Blocking reasons */}
            <div className="mt-5 space-y-2 text-sm">
              {q && !q.meetsMinimum && q.minimumOrder !== null && (
                <p className="text-nonveg">
                  Minimum order for delivery is {formatPrice(q.minimumOrder)} — add {formatPrice(q.minimumOrder - q.subtotal)} more, or
                  choose pickup.
                </p>
              )}
              {fulfilment === "delivery" && !checkedPincode && (
                <p className="text-ink/65">Check your pincode to confirm delivery.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !q || quote.status !== "ready" || !q.orderable || !deliveryReady}
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-ink text-[0.82rem] font-bold uppercase tracking-[0.18em] text-cream transition-colors hover:bg-copper disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-ink"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Placing order…" : q ? `Place order · ${formatPrice(q.total)}` : "Place order"}
            </button>
            {submitError && (
              <p role="alert" className="mt-3 text-sm text-nonveg">
                {submitError}
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink/55">
              Prices and totals are confirmed by our server when you place the order.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
