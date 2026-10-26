import { ordering } from "@/data/ordering";
import { business } from "@/data/business";
import { parseQuoteRequest, priceOrder } from "@/lib/pricing";
import { createOrder, getMenu, newId, newToken } from "@/lib/store";
import type { FieldErrors, Order, PaymentMethod } from "@/lib/types";
import { isEmail, isPhone, isPincode, normalisePhone, str } from "@/lib/validation";

/**
 * Places an order. Everything is re-validated and re-priced here; the client's
 * idea of the total is never trusted.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const req = parseQuoteRequest(body?.cart);
  if (!body || !req) return Response.json({ error: "Invalid request." }, { status: 400 });

  if (req.fulfilment === "delivery" && !business.services.delivery)
    return Response.json({ error: "Delivery isn't available." }, { status: 400 });
  if (req.fulfilment === "pickup" && !business.services.pickup)
    return Response.json({ error: "Pickup isn't available." }, { status: 400 });

  const customer = (body.customer ?? {}) as Record<string, unknown>;
  const address = (body.address ?? {}) as Record<string, unknown>;
  const name = str(customer.name, 80);
  const phone = str(customer.phone, 20);
  const email = str(customer.email, 120);
  const line1 = str(address.line1, 160);
  const line2 = str(address.line2, 160);
  const landmark = str(address.landmark, 120);
  const notes = str(body.notes, 500);
  const pincode = req.pincode?.trim() ?? "";

  const errors: FieldErrors = {};
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!isPhone(phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (email && !isEmail(email)) errors.email = "Enter a valid email address, or leave it blank.";
  if (req.fulfilment === "delivery") {
    if (line1.length < 5) errors.line1 = "Please enter your house / flat and street.";
    if (!isPincode(pincode)) errors.pincode = "Enter a 6-digit pincode.";
  }

  const quote = priceOrder(await getMenu(), req);
  if (Object.keys(errors).length) return Response.json({ errors, quote }, { status: 422 });
  if (!quote.orderable) {
    return Response.json({ error: "Your order needs attention before it can be placed.", quote }, { status: 409 });
  }

  const method: PaymentMethod = req.fulfilment === "delivery" ? "pay-on-delivery" : "pay-at-counter";
  const now = new Date().toISOString();
  const order: Order = {
    id: newId("NR"),
    token: newToken(),
    createdAt: now,
    updatedAt: now,
    status: "received",
    history: [{ status: "received", at: now }],
    fulfilment: req.fulfilment,
    customer: { name, phone: normalisePhone(phone), ...(email ? { email } : {}) },
    address:
      req.fulfilment === "delivery"
        ? { line1, ...(line2 ? { line2 } : {}), ...(landmark ? { landmark } : {}), pincode }
        : null,
    ...(notes ? { notes } : {}),
    payment: { method, status: "unpaid" },
    quote: {
      lines: quote.lines,
      subtotal: quote.subtotal,
      discount: quote.discount,
      promo: quote.promo,
      deliveryFee: quote.deliveryFee,
      tax: quote.tax,
      taxLabel: quote.taxLabel,
      total: quote.total,
      delivery: quote.delivery,
      minimumOrder: quote.minimumOrder,
      meetsMinimum: quote.meetsMinimum,
    },
    demo: ordering.mode === "demo",
  };

  await createOrder(order);
  return Response.json({ id: order.id, token: order.token }, { status: 201 });
}
