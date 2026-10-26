import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "received",
  "confirmed",
  "preparing",
  "ready",
  "out-for-delivery",
  "completed",
  "cancelled",
];

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/orders/[id]">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status as OrderStatus;
  if (!STATUSES.includes(status)) return Response.json({ error: "Unknown status." }, { status: 400 });

  const order = await updateOrderStatus(id, status);
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ ok: true });
}
