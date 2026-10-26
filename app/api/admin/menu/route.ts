import { requireAdmin } from "@/lib/auth";
import { parseMenuPatch, slugify } from "@/lib/admin-validation";
import { addMenuItem } from "@/lib/store";
import type { MenuItem } from "@/lib/types";

/** Adds a new dish. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const patch = parseMenuPatch(await request.json().catch(() => null));
  if (typeof patch === "string") return Response.json({ error: patch }, { status: 400 });
  if (!patch.name || !patch.category || !patch.portions?.length)
    return Response.json({ error: "Name, category and at least one portion are required." }, { status: 400 });

  const item: MenuItem = {
    id: slugify(patch.name) || `dish-${Date.now()}`,
    name: patch.name,
    description: patch.description ?? "",
    category: patch.category,
    isVeg: patch.isVeg ?? false,
    spice: patch.spice ?? null,
    badges: patch.badges ?? [],
    portions: patch.portions,
    available: patch.available ?? true,
    signature: patch.signature ?? false,
    image: patch.image ?? "/images/biryani-bowl-dark.jpg",
    imageAlt: patch.imageAlt ?? patch.name,
  };
  const created = await addMenuItem(item);
  if (!created) return Response.json({ error: "A dish with that name already exists." }, { status: 409 });
  return Response.json({ item: created }, { status: 201 });
}
