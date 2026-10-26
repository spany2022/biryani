"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ordering } from "@/data/ordering";
import type { CartLine, MenuItem } from "@/lib/types";

const STORAGE_KEY = "noor-cart-v1";

export type CartView = CartLine & {
  item: MenuItem | null;
  portionLabel: string;
  unitPrice: number;
  lineTotal: number;
  /** False when the dish or portion vanished or was marked unavailable. */
  ok: boolean;
};

type CartContextValue = {
  menu: MenuItem[];
  lines: CartLine[];
  view: CartView[];
  count: number;
  /** Indicative subtotal from current menu prices. The server re-prices at checkout. */
  subtotal: number;
  ready: boolean;
  add: (itemId: string, portionId: string, qty?: number) => void;
  setQty: (itemId: string, portionId: string, qty: number) => void;
  remove: (itemId: string, portionId: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Polite live-region message ("Added … to your order"). */
  announcement: string;
};

const CartContext = createContext<CartContextValue | null>(null);

const sameLine = (a: CartLine, itemId: string, portionId: string) =>
  a.itemId === itemId && a.portionId === portionId;

const clampQty = (n: number) => Math.max(0, Math.min(ordering.maxQtyPerLine, Math.round(n)));

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        l && typeof l.itemId === "string" && typeof l.portionId === "string" && Number.isInteger(l.qty) && l.qty > 0
    );
  } catch {
    return [];
  }
}

export default function CartProvider({ menu, children }: { menu: MenuItem[]; children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const announceTimer = useRef<number | undefined>(undefined);

  // Load after mount so server and client render the same (empty) cart first.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage can be unavailable (private mode); the cart still works for this visit.
    }
  }, [lines, ready]);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    window.clearTimeout(announceTimer.current);
    announceTimer.current = window.setTimeout(() => setAnnouncement(""), 4000);
  }, []);

  const byId = useMemo(() => new Map(menu.map((m) => [m.id, m])), [menu]);

  const add = useCallback(
    (itemId: string, portionId: string, qty = 1) => {
      const item = byId.get(itemId);
      const portion = item?.portions.find((p) => p.id === portionId);
      if (!item || !portion || !item.available) return;
      setLines((prev) => {
        const existing = prev.find((l) => sameLine(l, itemId, portionId));
        if (existing)
          return prev.map((l) => (l === existing ? { ...l, qty: clampQty(l.qty + qty) || 1 } : l));
        return [...prev, { itemId, portionId, qty: clampQty(qty) || 1 }];
      });
      const portionText = item.portions.length > 1 ? ` (${portion.label})` : "";
      announce(`Added ${item.name}${portionText} to your order.`);
    },
    [byId, announce]
  );

  const setQty = useCallback((itemId: string, portionId: string, qty: number) => {
    const next = clampQty(qty);
    setLines((prev) =>
      next === 0
        ? prev.filter((l) => !sameLine(l, itemId, portionId))
        : prev.map((l) => (sameLine(l, itemId, portionId) ? { ...l, qty: next } : l))
    );
  }, []);

  const remove = useCallback(
    (itemId: string, portionId: string) => {
      setLines((prev) => prev.filter((l) => !sameLine(l, itemId, portionId)));
      const item = byId.get(itemId);
      if (item) announce(`Removed ${item.name} from your order.`);
    },
    [byId, announce]
  );

  const clear = useCallback(() => setLines([]), []);

  const view = useMemo<CartView[]>(
    () =>
      lines.map((l) => {
        const item = byId.get(l.itemId) ?? null;
        const portion = item?.portions.find((p) => p.id === l.portionId);
        const unitPrice = portion?.price ?? 0;
        return {
          ...l,
          item,
          portionLabel: portion?.label ?? "",
          unitPrice,
          lineTotal: unitPrice * l.qty,
          ok: Boolean(item && portion && item.available),
        };
      }),
    [lines, byId]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      menu,
      lines,
      view,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: view.reduce((s, l) => s + (l.ok ? l.lineTotal : 0), 0),
      ready,
      add,
      setQty,
      remove,
      clear,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      announcement,
    }),
    [menu, lines, view, ready, add, setQty, remove, clear, isOpen, announcement]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
