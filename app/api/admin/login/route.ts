import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminEnabled, checkPassword, createSessionValue } from "@/lib/auth";

export async function POST(request: Request) {
  if (!adminEnabled()) return Response.json({ error: "The admin dashboard is disabled." }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkPassword(password)) {
    // A small fixed delay slows down guessing.
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ error: "That password isn't right." }, { status: 401 });
  }

  const session = createSessionValue();
  (await cookies()).set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expires,
  });
  return Response.json({ ok: true });
}
