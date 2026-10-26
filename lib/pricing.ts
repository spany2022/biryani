import { ordering } from "@/data/ordering";
import type { LineProblem, MenuItem, PricedLine, Quote, QuoteRequest } from "@/lib/types";

const round = (n: number) => Math.round(n);

/**
 * The single pricing engine. Runs on the server for every quote and order —
 * prices always come from the menu store, never from the client.
 */
export function priceOrder(menu: MenuItem[], req: QuoteRequest): Quote {
  const byId = new Map(menu.map((m) => [m.id, m]));
  const lines: PricedLine[] = [];
  const problems: LineProblem[] = [];

  for (const line of req.lines) {
    const item = byId.get(line.itemId);
    const portion = item?.portions.find((p) => p.id === line.portionId);
    if (!item || !portion) {
      problems.push({ ...line, reason: "not-found", message: "This dish is no longer on the menu." });
      continue;
    }
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > ordering.maxQtyPerLine) {
      problems.push({
        ...line,
        reason: "invalid-quantity",
        message: `Choose between 1 and ${ordering.maxQtyPerLine}.`,
      });
      continue;
    }
    if (!item.available) {
      problems.push({ ...line, reason: "unavailable", message: `${item.name} is unavailable right now.` });
      continue;
    }
    lines.push({
      ...line,
      name: item.name,
      portionLabel: portion.label,
      isVeg: item.isVeg,
      unitPrice: portion.price,
      lineTotal: portion.price * line.qty,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  // Promo code
  let discount = 0;
  let promo: Quote["promo"] = null;
  let promoError: string | null = null;
  const code = req.promoCode?.trim().toUpperCase();
  if (code) {
    const match = ordering.promoCodes.find((p) => p.code === code);
    if (!match) promoError = "That code isn't valid.";
    else if (subtotal < match.minSubtotal)
      promoError = `Add items worth ₹${match.minSubtotal - subtotal} more to use this code.`;
    else {
      discount = Math.min(round((subtotal * match.percentOff) / 100), match.maxDiscount);
      promo = { code: match.code, label: match.label };
    }
  }

  // Delivery
  const isDelivery = req.fulfilment === "delivery";
  const pincode = req.pincode?.trim();
  let delivery: Quote["delivery"] = { available: null, message: null };
  if (isDelivery && pincode) {
    if (!/^\d{6}$/.test(pincode)) delivery = { available: false, message: "Enter a 6-digit pincode." };
    else if (ordering.delivery.pincodes.includes(pincode))
      delivery = { available: true, message: `We deliver to ${pincode}. Estimated ${ordering.delivery.estimate}.` };
    else delivery = { available: false, message: `Sorry, we don't deliver to ${pincode} yet. Pickup is available.` };
  }

  const afterDiscount = subtotal - discount;
  const deliveryFee =
    isDelivery && afterDiscount > 0 && afterDiscount < ordering.delivery.freeAbove ? ordering.delivery.fee : 0;
  const tax = round(afterDiscount * ordering.taxRate);
  const total = afterDiscount + deliveryFee + tax;

  const minimumOrder = isDelivery ? ordering.delivery.minimumOrder : null;
  const meetsMinimum = minimumOrder === null || subtotal >= minimumOrder;

  const orderable =
    lines.length > 0 &&
    problems.length === 0 &&
    meetsMinimum &&
    !promoError &&
    (!isDelivery || delivery.available === true);

  return {
    lines,
    problems,
    subtotal,
    discount,
    promo,
    promoError,
    deliveryFee,
    tax,
    taxLabel: ordering.taxLabel,
    total,
    delivery,
    minimumOrder,
    meetsMinimum,
    orderable,
  };
}

/** Parses an untrusted quote request body into a safe shape. */
export function parseQuoteRequest(body: unknown): QuoteRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.lines) || b.lines.length > 50) return null;
  const lines = [];
  for (const raw of b.lines) {
    if (!raw || typeof raw !== "object") return null;
    const l = raw as Record<string, unknown>;
    if (typeof l.itemId !== "string" || typeof l.portionId !== "string" || typeof l.qty !== "number") return null;
    lines.push({ itemId: l.itemId.slice(0, 100), portionId: l.portionId.slice(0, 50), qty: l.qty });
  }
  const fulfilment = b.fulfilment === "pickup" ? "pickup" : "delivery";
  return {
    lines,
    fulfilment,
    pincode: typeof b.pincode === "string" ? b.pincode.slice(0, 10) : undefined,
    promoCode: typeof b.promoCode === "string" ? b.promoCode.slice(0, 30) : undefined,
  };
}
