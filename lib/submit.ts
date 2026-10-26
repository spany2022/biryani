import type { FieldErrors } from "@/lib/types";

export type SubmitResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors?: FieldErrors; message: string; data?: unknown };

/** POSTs JSON and normalises the API's error shapes for forms. */
export async function postJson<T>(url: string, body: unknown): Promise<SubmitResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data: data as T };
    return {
      ok: false,
      errors: data.errors,
      message: data.error ?? (data.errors ? "Please check the highlighted fields." : "Something went wrong."),
      data,
    };
  } catch {
    return { ok: false, message: "We couldn't reach the server. Check your connection and try again." };
  }
}

/** Reads a form into a plain object of trimmed strings. */
export const formValues = (form: HTMLFormElement) =>
  Object.fromEntries(
    Array.from(new FormData(form).entries()).map(([k, v]) => [k, typeof v === "string" ? v.trim() : ""])
  ) as Record<string, string>;
