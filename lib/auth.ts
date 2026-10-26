import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal password-based admin session (server only).
 * A signed, HTTP-only cookie holds the expiry time; nothing secret reaches the client.
 */

export const ADMIN_COOKIE = "noor_admin";
const SESSION_HOURS = 12;

export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

const secret = () =>
  process.env.ADMIN_SESSION_SECRET ||
  createHash("sha256").update(`session:${process.env.ADMIN_PASSWORD ?? ""}`).digest("hex");

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

const safeEqual = (a: string, b: string) => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export const checkPassword = (attempt: string) =>
  adminEnabled() && safeEqual(attempt, process.env.ADMIN_PASSWORD as string);

export function createSessionValue() {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  return { value: `${expires}.${sign(String(expires))}`, expires: new Date(expires) };
}

function verify(value: string | undefined) {
  if (!value || !adminEnabled()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires));
}

export async function isAdmin() {
  const store = await cookies();
  return verify(store.get(ADMIN_COOKIE)?.value);
}

/** Use at the top of admin API routes. Returns a 401 response when not signed in. */
export async function requireAdmin(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return Response.json({ error: "Not signed in." }, { status: 401 });
}
