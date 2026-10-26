import type { FieldErrors } from "@/lib/types";

/** Small, dependency-free validators shared by the forms and the API routes. */

export const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Normalises Indian mobile numbers: "+91 98765 43210" → "9876543210". */
export const normalisePhone = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};

export const isPhone = (v: string) => /^[6-9]\d{9}$/.test(normalisePhone(v));
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const isPincode = (v: string) => /^\d{6}$/.test(v);
export const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export function requireFields(values: Record<string, string>, labels: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  for (const [key, label] of Object.entries(labels)) {
    if (!values[key]) errors[key] = `${label} is required.`;
  }
  return errors;
}

/** Today's date (local) as YYYY-MM-DD, for min= on date inputs. */
export const todayIso = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
