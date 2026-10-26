import { requireAdmin } from "@/lib/auth";
import { getEnquiries, getMenu, getOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const [menu, orders, enquiries] = await Promise.all([getMenu(), getOrders(), getEnquiries()]);
  return Response.json({ menu, orders, enquiries });
}
