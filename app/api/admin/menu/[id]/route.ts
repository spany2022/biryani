import { requireAdmin } from "@/lib/auth";
import { parseMenuPatch } from "@/lib/admin-validation";
import { deleteMenuItem, updateMenuItem } from "@/lib/store";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/menu/[id]">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;

  const patch = parseMenuPatch(await request.json().catch(() => null));
  if (typeof patch === "string") return Response.json({ error: patch }, { status: 400 });
  const item = await updateMenuItem(id, patch);
  if (!item) return Response.json({ error: "Dish not found." }, { status: 404 });
  return Response.json({ item });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/menu/[id]">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  if (!(await deleteMenuItem(id))) return Response.json({ error: "Dish not found." }, { status: 404 });
  return Response.json({ ok: true });
}
