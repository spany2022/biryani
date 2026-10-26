import { requireAdmin } from "@/lib/auth";
import { updateEnquiryStatus } from "@/lib/store";
import type { Enquiry } from "@/lib/types";

const STATUSES: Enquiry["status"][] = ["new", "contacted", "closed"];

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/enquiries/[id]">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = body?.status as Enquiry["status"];
  if (!STATUSES.includes(status)) return Response.json({ error: "Unknown status." }, { status: 400 });

  const enquiry = await updateEnquiryStatus(id, status);
  if (!enquiry) return Response.json({ error: "Enquiry not found." }, { status: 404 });
  return Response.json({ ok: true });
}
