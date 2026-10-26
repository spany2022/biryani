import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { seedMenu } from "@/data/menu";
import type { Enquiry, MenuItem, Order } from "@/lib/types";

/**
 * A tiny JSON-file data store (server only).
 *
 * Good enough for the demo and for a single small server. It is NOT suitable for
 * serverless hosting (read-only / ephemeral file systems) or multiple instances —
 * swap these functions for a real database (Postgres, SQLite, Supabase…) before
 * going live. Every other module talks to the data only through this file.
 */

type Data = {
  version: 1;
  menu: MenuItem[];
  orders: Order[];
  enquiries: Enquiry[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

// Next.js can load this module more than once (route handlers and pages live in
// separate module graphs), so the cache and the write queue live on globalThis
// to be shared by every copy in the process.
type StoreState = { cache: Data | null; queue: Promise<unknown> };
const state: StoreState = ((globalThis as { __noorStore?: StoreState }).__noorStore ??= {
  cache: null,
  queue: Promise.resolve(),
});

async function load(): Promise<Data> {
  if (state.cache) return state.cache;
  try {
    state.cache = JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as Data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    state.cache = { version: 1, menu: structuredClone(seedMenu), orders: [], enquiries: [] };
    await persist(state.cache);
  }
  return state.cache;
}

async function persist(data: Data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

/** Serialises writes so concurrent requests can't clobber each other. */
function mutate<T>(fn: (data: Data) => T | Promise<T>): Promise<T> {
  const run = state.queue.then(async () => {
    const data = await load();
    const result = await fn(data);
    await persist(data);
    return result;
  });
  state.queue = run.catch(() => undefined);
  return run;
}

export const newId = (prefix: string) =>
  `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
export const newToken = () => randomBytes(16).toString("hex");

// ── Menu ────────────────────────────────────────────────────────────

export async function getMenu(): Promise<MenuItem[]> {
  return (await load()).menu;
}

export function updateMenuItem(id: string, patch: Partial<Omit<MenuItem, "id">>) {
  return mutate((data) => {
    const item = data.menu.find((m) => m.id === id);
    if (!item) return null;
    Object.assign(item, patch);
    return item;
  });
}

export function addMenuItem(item: MenuItem) {
  return mutate((data) => {
    if (data.menu.some((m) => m.id === item.id)) return null;
    data.menu.push(item);
    return item;
  });
}

export function deleteMenuItem(id: string) {
  return mutate((data) => {
    const before = data.menu.length;
    data.menu = data.menu.filter((m) => m.id !== id);
    return data.menu.length !== before;
  });
}

// ── Orders ──────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  return [...(await load()).orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | null> {
  return (await load()).orders.find((o) => o.id === id) ?? null;
}

export function createOrder(order: Order) {
  return mutate((data) => {
    data.orders.push(order);
    return order;
  });
}

export function updateOrderStatus(id: string, status: Order["status"]) {
  return mutate((data) => {
    const order = data.orders.find((o) => o.id === id);
    if (!order) return null;
    const at = new Date().toISOString();
    order.status = status;
    order.updatedAt = at;
    order.history.push({ status, at });
    return order;
  });
}

// ── Enquiries (catering + reservations) ─────────────────────────────

export async function getEnquiries(): Promise<Enquiry[]> {
  return [...(await load()).enquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createEnquiry(enquiry: Enquiry) {
  return mutate((data) => {
    data.enquiries.push(enquiry);
    return enquiry;
  });
}

export function updateEnquiryStatus(id: string, status: Enquiry["status"]) {
  return mutate((data) => {
    const enquiry = data.enquiries.find((e) => e.id === id);
    if (!enquiry) return null;
    enquiry.status = status;
    return enquiry;
  });
}
