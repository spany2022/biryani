"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Briefcase, CheckCircle2, Loader2, PartyPopper, Soup, Users, UtensilsCrossed } from "lucide-react";
import Field, { Honeypot } from "@/components/ui/Field";
import SplitHeading from "@/components/ui/SplitHeading";
import { business, telHref } from "@/data/business";
import { ordering } from "@/data/ordering";
import { gsap, useGSAP, motionQueries } from "@/lib/gsap";
import { formValues, postJson } from "@/lib/submit";
import type { FieldErrors } from "@/lib/types";
import { todayIso } from "@/lib/validation";

const offerings = [
  { key: "familyPacks", label: "Family biryani packs", body: "Handis sized for four to six, with salan and raita.", icon: Users },
  { key: "partyOrders", label: "Party & celebration orders", body: "Birthdays, anniversaries and get-togethers at home.", icon: PartyPopper },
  { key: "officeLunch", label: "Office lunch orders", body: "Individually packed boxes, delivered together.", icon: Briefcase },
  { key: "eventCatering", label: "Wedding & event catering", body: "Biryani, kebabs and desserts for larger occasions.", icon: UtensilsCrossed },
  { key: "bulkOrders", label: "Bulk biryani orders", body: "Large quantities by the handi for any gathering.", icon: Soup },
] as const;

export default function Feasts() {
  const root = useRef<HTMLElement>(null);
  const available = offerings.filter((o) => business.services[o.key]);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionQueries.motion, () => {
        gsap.fromTo(
          "[data-feast-bg]",
          { scale: 1.2, yPercent: -6 },
          { scale: 1, yPercent: 6, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } }
        );
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  if (available.length === 0) return null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const v = formValues(form);
    setStatus("sending");
    setMessage("");
    const res = await postJson<{ id: string }>("/api/enquiries", { type: "catering", ...v, guests: Number(v.guests) });
    if (res.ok) {
      setReference(res.data.id);
      setStatus("done");
      setErrors({});
      form.reset();
    } else {
      setErrors(res.errors ?? {});
      setMessage(res.message);
      setStatus("idle");
      const firstInvalid = Object.keys(res.errors ?? {})[0];
      if (firstInvalid) (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
    }
  };

  return (
    <section ref={root} id="feasts" aria-labelledby="feasts-title" className="on-dark relative overflow-hidden bg-midnight text-cream">
      <div className="absolute inset-0" aria-hidden="true">
        <div data-feast-bg className="absolute inset-0">
          <Image src="/images/dining-copper.jpg" alt="" fill sizes="100vw" quality={60} className="object-cover opacity-35" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-midnight via-midnight/80 to-midnight" />
      </div>

      <div className="relative mx-auto grid max-w-[90rem] gap-16 px-5 py-28 md:px-10 md:py-36 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-saffron">Special Orders & Family Feasts</p>
          <SplitHeading
            id="feasts-title"
            lines={[["Bring the Royal Feast"], [{ text: "to Your Table.", italic: true, className: "text-saffron" }]]}
            className="mt-5 font-serif text-headline font-light"
          />
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/70">
            From family gatherings to memorable celebrations, make every occasion special with the flavours of Hyderabadi
            biryani.
          </p>
          <ul className="mt-12 divide-y divide-cream/10 border-y border-cream/10">
            {available.map(({ key, label, body, icon: Icon }) => (
              <li key={key} className="flex items-start gap-5 py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-saffron/40 text-saffron">
                  <Icon className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl">{label}</h3>
                  <p className="mt-1 text-sm text-cream/60">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          {(business.phone || business.email) && (
            <p className="mt-8 text-sm text-cream/70">
              Prefer to talk?{" "}
              {business.phone && (
                <a href={telHref(business.phone)} className="font-semibold text-saffron underline-offset-4 hover:underline">
                  Call {business.phone}
                </a>
              )}
              {business.phone && business.email && " or "}
              {business.email && (
                <a href={`mailto:${business.email}`} className="font-semibold text-saffron underline-offset-4 hover:underline">
                  {business.email}
                </a>
              )}
            </p>
          )}
        </div>

        <div className="rounded-[2rem] border border-cream/12 bg-charcoal/80 p-6 backdrop-blur-md md:p-10">
          {status === "done" ? (
            <div className="flex h-full flex-col items-start justify-center gap-4" role="status">
              <CheckCircle2 className="h-12 w-12 text-saffron" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="font-serif text-4xl">Thank you — we&apos;ve got it.</h3>
              <p className="text-cream/75">
                Your enquiry reference is <strong className="text-saffron">{reference}</strong>. Our team will contact you to
                discuss the menu, quantities and pricing. Nothing is booked or charged until you confirm.
              </p>
              {ordering.mode === "demo" && (
                <p className="text-sm text-cream/55">Demo mode: the enquiry is saved for the admin dashboard only.</p>
              )}
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-2 text-sm font-semibold text-saffron underline-offset-4 hover:underline"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
              <h3 className="font-serif text-3xl sm:col-span-2">Plan your feast</h3>
              <Honeypot />
              <Field label="Name" error={errors.name}>
                {(p) => <input {...p} name="name" autoComplete="name" className="field-input" />}
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                {(p) => <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field-input" />}
              </Field>
              <Field label="What do you need?" error={errors.service} className="sm:col-span-2">
                {(p) => (
                  <select {...p} name="service" defaultValue="" className="field-input">
                    <option value="" disabled>
                      Choose an option
                    </option>
                    {available.map((o) => (
                      <option key={o.key}>{o.label}</option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Event date" error={errors.date}>
                {(p) => <input {...p} name="date" type="date" min={todayIso()} className="field-input [color-scheme:dark]" />}
              </Field>
              <Field label="Number of guests" error={errors.guests}>
                {(p) => <input {...p} name="guests" type="number" inputMode="numeric" min={1} max={5000} className="field-input" />}
              </Field>
              <Field label="Email" optional error={errors.email} className="sm:col-span-2">
                {(p) => <input {...p} name="email" type="email" autoComplete="email" className="field-input" />}
              </Field>
              <Field label="Tell us about the occasion" optional className="sm:col-span-2">
                {(p) => (
                  <textarea
                    {...p}
                    name="notes"
                    rows={4}
                    placeholder="Venue or delivery area, dishes you'd like, dietary needs…"
                    className="field-input resize-y"
                  />
                )}
              </Field>
              <div className="flex flex-col gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-saffron px-7 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-midnight transition-colors hover:bg-cream disabled:opacity-60"
                >
                  {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {status === "sending" ? "Sending…" : "Send Enquiry"}
                </button>
                <p className="text-xs text-cream/50">We only use your details to reply to this enquiry.</p>
                {message && (
                  <p className="text-sm text-[#e08a6c]" role="alert">
                    {message}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
