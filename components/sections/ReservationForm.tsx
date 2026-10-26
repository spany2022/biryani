"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import Field, { Honeypot } from "@/components/ui/Field";
import { business } from "@/data/business";
import { ordering } from "@/data/ordering";
import { formValues, postJson } from "@/lib/submit";
import type { FieldErrors } from "@/lib/types";
import { todayIso } from "@/lib/validation";

/** Table reservation *request* — the restaurant confirms by phone. */
export default function ReservationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const v = formValues(form);
    setStatus("sending");
    setMessage("");
    const res = await postJson<{ id: string }>("/api/enquiries", { type: "reservation", ...v, guests: Number(v.guests) });
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

  if (status === "done") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[1.75rem] border border-saffron/30 bg-charcoal/60 p-8" role="status">
        <CheckCircle2 className="h-10 w-10 text-saffron" strokeWidth={1.25} aria-hidden="true" />
        <h3 className="font-serif text-3xl">Request received</h3>
        <p className="text-cream/75">
          Your reference is <strong className="font-semibold text-saffron">{reference}</strong>. This is a request, not a
          confirmed booking — {business.name} will call you to confirm your table.
        </p>
        {ordering.mode === "demo" && (
          <p className="text-sm text-cream/55">Demo mode: the request is saved for the admin dashboard, but nobody will call.</p>
        )}
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-semibold text-saffron underline-offset-4 hover:underline"
        >
          Make another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2" aria-describedby="reservation-note">
      <Honeypot />
      <Field label="Name" error={errors.name}>
        {(p) => <input {...p} name="name" autoComplete="name" required className="field-input" />}
      </Field>
      <Field label="Mobile number" error={errors.phone}>
        {(p) => (
          <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="98765 43210" className="field-input" />
        )}
      </Field>
      <Field label="Date" error={errors.date}>
        {(p) => <input {...p} name="date" type="date" min={todayIso()} required className="field-input [color-scheme:dark]" />}
      </Field>
      <Field label="Time" error={errors.time}>
        {(p) => <input {...p} name="time" type="time" required step={900} className="field-input [color-scheme:dark]" />}
      </Field>
      <Field label="Guests" error={errors.guests}>
        {(p) => (
          <select {...p} name="guests" defaultValue="2" className="field-input">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Occasion" optional>
        {(p) => (
          <select {...p} name="occasion" defaultValue="" className="field-input">
            <option value="">Just dinner</option>
            <option>Birthday</option>
            <option>Anniversary</option>
            <option>Family gathering</option>
            <option>Business meal</option>
          </select>
        )}
      </Field>
      <Field label="Email" optional error={errors.email} className="sm:col-span-2">
        {(p) => <input {...p} name="email" type="email" autoComplete="email" className="field-input" />}
      </Field>
      <Field label="Anything we should know?" optional className="sm:col-span-2">
        {(p) => <textarea {...p} name="notes" rows={3} className="field-input resize-y" />}
      </Field>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p id="reservation-note" className="text-sm text-cream/55">
          A request, not a confirmed booking — we&apos;ll call to confirm.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-saffron px-7 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-midnight transition-colors hover:bg-cream disabled:opacity-60"
        >
          {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {status === "sending" ? "Sending…" : "Request a Table"}
        </button>
      </div>
      {message && (
        <p className="text-sm text-[#e08a6c] sm:col-span-2" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
