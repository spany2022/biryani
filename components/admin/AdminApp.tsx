"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, LogOut, Plus, RefreshCw, Trash2 } from "lucide-react";
import { DietMark } from "@/components/ui/DishMeta";
import { categories } from "@/data/menu";
import { formatPrice } from "@/lib/money";
import type { Badge, Enquiry, MenuItem, Order, OrderStatus, Portion } from "@/lib/types";
import { cn } from "@/lib/utils";

type Data = { menu: MenuItem[]; orders: Order[]; enquiries: Enquiry[] };
type Tab = "orders" | "menu" | "enquiries";

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready for pickup" },
  { value: "out-for-delivery", label: "Out for delivery" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const BADGES: { value: Badge; label: string }[] = [
  { value: "bestseller", label: "Bestseller" },
  { value: "chef-special", label: "Chef's Special" },
  { value: "new", label: "New" },
];

const when = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

async function send(url: string, method: "PATCH" | "POST" | "DELETE", body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data;
}

export default function AdminApp({ initial, images }: { initial: Data; images: string[] }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>("orders");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) return router.refresh();
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Keep the orders list fresh while the dashboard is open.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, 20_000);
    return () => window.clearInterval(id);
  }, [reload]);

  const flash = (kind: "ok" | "error", text: string) => {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn();
      flash("ok", success);
      await reload();
      return true;
    } catch (e) {
      flash("error", (e as Error).message);
      return false;
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  const activeOrders = data.orders.filter((o) => o.status !== "completed" && o.status !== "cancelled").length;
  const newEnquiries = data.enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="mx-auto max-w-[80rem]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-copper-ink">Kitchen dashboard</p>
          <h1 className="mt-3 font-serif text-5xl">Orders, menu & enquiries</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reload}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-semibold hover:bg-ink hover:text-cream"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" /> Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-semibold hover:bg-ink hover:text-cream"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>

      <div role="tablist" aria-label="Dashboard sections" className="mt-10 flex gap-2 border-b border-ink/10">
        {(
          [
            ["orders", `Orders${activeOrders ? ` (${activeOrders} active)` : ""}`],
            ["menu", `Menu (${data.menu.length})`],
            ["enquiries", `Enquiries${newEnquiries ? ` (${newEnquiries} new)` : ""}`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
              tab === id ? "border-copper text-ink" : "border-transparent text-ink/55 hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p role="status" aria-live="polite" className="min-h-8 pt-3 text-sm">
        {notice && <span className={notice.kind === "ok" ? "text-veg" : "text-nonveg"}>{notice.text}</span>}
      </p>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "orders" && (
          <OrdersPanel
            orders={data.orders}
            onStatus={(id, status) => run(() => send(`/api/admin/orders/${id}`, "PATCH", { status }), `Order ${id} → ${status}.`)}
          />
        )}
        {tab === "menu" && (
          <MenuPanel
            menu={data.menu}
            images={images}
            onSave={(id, patch) => run(() => send(`/api/admin/menu/${id}`, "PATCH", patch), "Saved.")}
            onCreate={(item) => run(() => send(`/api/admin/menu`, "POST", item), "Dish added.")}
            onDelete={(id) => run(() => send(`/api/admin/menu/${id}`, "DELETE"), "Dish removed.")}
          />
        )}
        {tab === "enquiries" && (
          <EnquiriesPanel
            enquiries={data.enquiries}
            onStatus={(id, status) => run(() => send(`/api/admin/enquiries/${id}`, "PATCH", { status }), "Updated.")}
          />
        )}
      </div>
    </div>
  );
}

// ── Orders ─────────────────────────────────────────────────────────

function OrdersPanel({ orders, onStatus }: { orders: Order[]; onStatus: (id: string, s: OrderStatus) => void }) {
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? orders : orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");

  return (
    <div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-copper" />
        Show completed and cancelled orders
      </label>
      {list.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink/60">
          No {showAll ? "" : "active "}orders yet. Place one from the checkout to see it here.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((o) => (
            <li key={o.id} className="rounded-2xl border border-ink/10 bg-ivory/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {o.id} · {o.fulfilment === "delivery" ? "Delivery" : "Pickup"}
                    {o.demo && <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs font-normal">demo</span>}
                  </p>
                  <p className="text-sm text-ink/65">
                    {when.format(new Date(o.createdAt))} · {o.customer.name} ·{" "}
                    <a href={`tel:${o.customer.phone}`} className="underline">
                      {o.customer.phone}
                    </a>
                  </p>
                  {o.address && (
                    <p className="text-sm text-ink/65">
                      {[o.address.line1, o.address.line2, o.address.landmark, o.address.pincode].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl tabular-nums">{formatPrice(o.quote.total)}</span>
                  <label>
                    <span className="sr-only">Status for order {o.id}</span>
                    <select
                      value={o.status}
                      onChange={(e) => onStatus(o.id, e.target.value as OrderStatus)}
                      className="field-input min-h-10 w-48 py-1.5 text-sm"
                    >
                      {ORDER_STATUSES.filter(
                        (s) => !(o.fulfilment === "delivery" && s.value === "ready") && !(o.fulfilment === "pickup" && s.value === "out-for-delivery")
                      ).map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {o.quote.lines.map((l) => (
                  <li key={`${l.itemId}:${l.portionId}`}>
                    <strong>{l.qty}×</strong> {l.name}
                    {l.portionLabel && <span className="text-ink/60"> ({l.portionLabel})</span>}
                  </li>
                ))}
              </ul>
              {o.notes && <p className="mt-2 text-sm italic text-ink/70">“{o.notes}”</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Menu ───────────────────────────────────────────────────────────

type Draft = Omit<MenuItem, "id">;

const blankDraft = (): Draft => ({
  name: "",
  description: "",
  category: "biryani",
  isVeg: false,
  spice: null,
  badges: [],
  portions: [{ id: "", label: "Regular", price: 0 }],
  available: true,
  signature: false,
  image: "/images/biryani-bowl-dark.jpg",
  imageAlt: "",
});

function MenuPanel({
  menu,
  images,
  onSave,
  onCreate,
  onDelete,
}: {
  menu: MenuItem[];
  images: string[];
  onSave: (id: string, patch: Partial<Draft>) => Promise<boolean>;
  onCreate: (item: Draft) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink/65">Changes appear on the website immediately. Prices are in whole rupees.</p>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-cream hover:bg-copper"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add a dish
        </button>
      </div>

      {adding && (
        <div className="mt-6 rounded-2xl border border-copper/30 bg-ivory/50 p-5">
          <h2 className="font-serif text-2xl">New dish</h2>
          <DishEditor
            draft={blankDraft()}
            images={images}
            submitLabel="Add dish"
            onSubmit={async (d) => {
              if (await onCreate(d)) setAdding(false);
            }}
          />
        </div>
      )}

      {categories.map((c) => {
        const items = menu.filter((m) => m.category === c.id);
        if (!items.length) return null;
        return (
          <section key={c.id} className="mt-10" aria-labelledby={`admin-cat-${c.id}`}>
            <h2 id={`admin-cat-${c.id}`} className="font-serif text-3xl">
              {c.name}
            </h2>
            <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex flex-wrap items-center gap-4 py-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ivory">
                      <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-semibold">
                        <DietMark isVeg={item.isVeg} className="h-3.5 w-3.5" />
                        {item.name}
                        {item.signature && <span className="rounded-full bg-saffron/30 px-2 py-0.5 text-xs font-normal">signature</span>}
                      </p>
                      <p className="text-sm tabular-nums text-ink/60">
                        {item.portions.map((p) => `${p.label} ${formatPrice(p.price)}`).join(" · ")}
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={item.available}
                        onChange={(e) => onSave(item.id, { available: e.target.checked })}
                        className="h-4 w-4 accent-copper"
                      />
                      {item.available ? "Available" : "Unavailable"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpen(open === item.id ? null : item.id)}
                      aria-expanded={open === item.id}
                      className="inline-flex min-h-10 items-center gap-1 rounded-full border border-ink/20 px-4 text-sm font-semibold hover:bg-ink hover:text-cream"
                    >
                      Edit <ChevronDown className={cn("h-4 w-4 transition-transform", open === item.id && "rotate-180")} aria-hidden="true" />
                    </button>
                  </div>
                  {open === item.id && (
                    <div className="pb-6">
                      <DishEditor
                        draft={item}
                        images={images}
                        submitLabel="Save changes"
                        onSubmit={async (d) => {
                          if (await onSave(item.id, d)) setOpen(null);
                        }}
                        onDelete={async () => {
                          if (window.confirm(`Remove ${item.name} from the menu? This can't be undone.`)) await onDelete(item.id);
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function DishEditor({
  draft: initial,
  images,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  draft: Draft;
  images: string[];
  submitLabel: string;
  onSubmit: (d: Draft) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [d, setD] = useState<Draft>(() => ({
    name: initial.name,
    description: initial.description,
    category: initial.category,
    isVeg: initial.isVeg,
    spice: initial.spice,
    badges: [...initial.badges],
    portions: initial.portions.map((p) => ({ ...p })),
    available: initial.available,
    signature: initial.signature,
    image: initial.image,
    imageAlt: initial.imageAlt,
  }));
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setPortion = (i: number, patch: Partial<Portion>) =>
    set("portions", d.portions.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <form
      className="mt-4 grid gap-4 md:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await onSubmit(d);
        setBusy(false);
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Name
        <input required value={d.name} onChange={(e) => set("name", e.target.value)} className="field-input font-normal" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Category
        <select value={d.category} onChange={(e) => set("category", e.target.value as Draft["category"])} className="field-input font-normal">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold md:col-span-2">
        Description
        <textarea rows={2} value={d.description} onChange={(e) => set("description", e.target.value)} className="field-input resize-y font-normal" />
      </label>

      <fieldset className="md:col-span-2">
        <legend className="text-sm font-semibold">Portions & prices (₹)</legend>
        <div className="mt-2 space-y-2">
          {d.portions.map((p, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input aria-label="Portion name" value={p.label} onChange={(e) => setPortion(i, { label: e.target.value })} className="field-input min-h-10 w-36 py-1.5" />
              <input
                aria-label="Serves"
                placeholder="Serves… (optional)"
                value={p.serves ?? ""}
                onChange={(e) => setPortion(i, { serves: e.target.value || undefined })}
                className="field-input min-h-10 w-44 py-1.5"
              />
              <input
                aria-label="Price in rupees"
                type="number"
                min={0}
                step={1}
                value={p.price}
                onChange={(e) => setPortion(i, { price: Math.round(Number(e.target.value)) })}
                className="field-input min-h-10 w-28 py-1.5 tabular-nums"
              />
              {d.portions.length > 1 && (
                <button
                  type="button"
                  onClick={() => set("portions", d.portions.filter((_, j) => j !== i))}
                  aria-label={`Remove portion ${p.label}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/10"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
        {d.portions.length < 6 && (
          <button
            type="button"
            onClick={() => set("portions", [...d.portions, { id: "", label: "", price: 0 }])}
            className="mt-2 text-sm font-semibold underline"
          >
            + Add portion
          </button>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm md:col-span-2">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={d.isVeg} onChange={(e) => set("isVeg", e.target.checked)} className="h-4 w-4 accent-copper" />
          Vegetarian
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={d.available} onChange={(e) => set("available", e.target.checked)} className="h-4 w-4 accent-copper" />
          Available
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={d.signature} onChange={(e) => set("signature", e.target.checked)} className="h-4 w-4 accent-copper" />
          Show in Signature Collection
        </label>
        {BADGES.map((b) => (
          <label key={b.value} className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={d.badges.includes(b.value)}
              onChange={(e) => set("badges", e.target.checked ? [...d.badges, b.value] : d.badges.filter((x) => x !== b.value))}
              className="h-4 w-4 accent-copper"
            />
            {b.label}
          </label>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Spice level
        <select
          value={d.spice === null ? "" : String(d.spice)}
          onChange={(e) => set("spice", e.target.value === "" ? null : (Number(e.target.value) as Draft["spice"]))}
          className="field-input font-normal"
        >
          <option value="">Not applicable</option>
          <option value="0">Mild</option>
          <option value="1">Medium</option>
          <option value="2">Spicy</option>
          <option value="3">Hot</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Photo
        <select value={d.image} onChange={(e) => set("image", e.target.value)} className="field-input font-normal">
          {images.map((src) => (
            <option key={src} value={src}>
              {src.replace("/images/", "")}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold md:col-span-2">
        Photo description (alt text)
        <input value={d.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} className="field-input font-normal" />
      </label>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-cream hover:bg-copper disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-nonveg hover:bg-nonveg/10">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove dish
          </button>
        )}
        <p className="text-xs text-ink/55">To use a new photo, add it to /public/images and reload this page.</p>
      </div>
    </form>
  );
}

// ── Enquiries ──────────────────────────────────────────────────────

function EnquiriesPanel({ enquiries, onStatus }: { enquiries: Enquiry[]; onStatus: (id: string, s: Enquiry["status"]) => void }) {
  if (enquiries.length === 0)
    return <p className="mt-6 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-ink/60">No enquiries yet.</p>;
  return (
    <ul className="mt-2 space-y-4">
      {enquiries.map((e) => (
        <li key={e.id} className="rounded-2xl border border-ink/10 bg-ivory/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold">
                {e.type === "reservation" ? "Table request" : "Feast enquiry"} · {e.id}
              </p>
              <p className="text-sm text-ink/65">
                Received {when.format(new Date(e.createdAt))} · {e.name} ·{" "}
                <a href={`tel:${e.phone}`} className="underline">
                  {e.phone}
                </a>
                {e.email && <> · {e.email}</>}
              </p>
            </div>
            <label>
              <span className="sr-only">Status for {e.id}</span>
              <select
                value={e.status}
                onChange={(ev) => onStatus(e.id, ev.target.value as Enquiry["status"])}
                className="field-input min-h-10 w-40 py-1.5 text-sm"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-sm">
            {[e.service, e.date && `on ${e.date}`, e.time && `at ${e.time}`, e.guests && `${e.guests} guests`, e.occasion]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {e.notes && <p className="mt-1 text-sm italic text-ink/70">“{e.notes}”</p>}
        </li>
      ))}
    </ul>
  );
}
