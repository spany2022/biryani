"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import Field from "@/components/ui/Field";
import { postJson } from "@/lib/submit";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password");
    setBusy(true);
    setError("");
    const res = await postJson("/api/admin/login", { password });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError(res.message);
  };

  return (
    <div className="mx-auto max-w-sm py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-cream">
        <Lock className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-serif text-5xl">Kitchen dashboard</h1>
      <p className="mt-3 text-ink/70">Sign in to manage orders, the menu and enquiries.</p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <Field label="Password" error={error}>
          {(p) => <input {...p} name="password" type="password" autoComplete="current-password" required className="field-input" />}
        </Field>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink text-[0.78rem] font-bold uppercase tracking-[0.16em] text-cream hover:bg-copper disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Sign in
        </button>
      </form>
    </div>
  );
}
