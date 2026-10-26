import { timingSafeEqual } from "node:crypto";
import { getOrder } from "@/lib/store";
import type { PublicOrder } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Order status for the customer. Requires the secret token from the tracking link. */
export async function GET(request: Request, ctx: RouteContext<"/api/orders/[id]">) {
  const { id } = await ctx.params;
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const order = await getOrder(id);
  const valid =
    order !== null &&
    token.length === order.token.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(order.token));
  if (!order || !valid) return Response.json({ error: "Order not found." }, { status: 404 });

  const publicOrder: PublicOrder = { ...order };
  delete (publicOrder as Partial<typeof order>).token;
  return Response.json({ order: publicOrder });
}
