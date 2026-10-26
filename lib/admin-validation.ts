import { categories } from "@/data/menu";
import type { Badge, CategoryId, MenuItem, Portion } from "@/lib/types";
import { str } from "@/lib/validation";

const BADGES: Badge[] = ["bestseller", "chef-special", "new"];
const CATEGORY_IDS = categories.map((c) => c.id);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .slice(0, 60);

function parsePortions(v: unknown): Portion[] | string {
  if (!Array.isArray(v) || v.length === 0 || v.length > 6) return "Add between 1 and 6 portions.";
  const portions: Portion[] = [];
  for (const raw of v) {
    const p = (raw ?? {}) as Record<string, unknown>;
    const label = str(p.label, 40);
    const price = Number(p.price);
    if (!label) return "Every portion needs a label.";
    if (!Number.isInteger(price) || price < 0 || price > 100000) return "Prices must be whole rupees (0 or more).";
    const serves = str(p.serves, 40);
    portions.push({
      id: str(p.id, 40) || slugify(label) || `p${portions.length + 1}`,
      label,
      ...(serves ? { serves } : {}),
      price,
    });
  }
  if (new Set(portions.map((p) => p.id)).size !== portions.length) return "Portion names must be unique.";
  return portions;
}

/**
 * Validates an admin edit. Only known fields pass through; anything else is dropped.
 * Returns either a clean patch or an error message.
 */
export function parseMenuPatch(body: unknown): Partial<Omit<MenuItem, "id">> | string {
  if (!body || typeof body !== "object") return "Invalid request.";
  const b = body as Record<string, unknown>;
  const patch: Partial<Omit<MenuItem, "id">> = {};

  if ("name" in b) {
    const name = str(b.name, 80);
    if (name.length < 2) return "Name is too short.";
    patch.name = name;
  }
  if ("description" in b) patch.description = str(b.description, 400);
  if ("category" in b) {
    if (!CATEGORY_IDS.includes(b.category as CategoryId)) return "Unknown category.";
    patch.category = b.category as CategoryId;
  }
  if ("isVeg" in b) patch.isVeg = Boolean(b.isVeg);
  if ("available" in b) patch.available = Boolean(b.available);
  if ("signature" in b) patch.signature = Boolean(b.signature);
  if ("spice" in b) {
    const s = b.spice;
    if (s !== null && ![0, 1, 2, 3].includes(s as number)) return "Spice must be 0–3 or none.";
    patch.spice = s as MenuItem["spice"];
  }
  if ("badges" in b) {
    if (!Array.isArray(b.badges) || !b.badges.every((x) => BADGES.includes(x as Badge))) return "Unknown badge.";
    patch.badges = [...new Set(b.badges as Badge[])];
  }
  if ("portions" in b) {
    const portions = parsePortions(b.portions);
    if (typeof portions === "string") return portions;
    patch.portions = portions;
  }
  if ("image" in b) {
    const image = str(b.image, 200);
    if (!/^\/images\/[\w.-]+\.(jpe?g|png|webp|avif)$/i.test(image)) return "Choose an image from /images.";
    patch.image = image;
  }
  if ("imageAlt" in b) patch.imageAlt = str(b.imageAlt, 200);
  return patch;
}
