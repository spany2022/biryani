/**
 * Shared domain types. Used by the server store, the pricing engine,
 * the API routes and the client components alike.
 */

export type CategoryId =
  | "biryani"
  | "kebabs"
  | "curries"
  | "vegetarian"
  | "breads"
  | "desserts"
  | "beverages"
  | "combos";

export type Category = {
  id: CategoryId;
  name: string;
  /** Short line shown under the category heading in the menu. */
  blurb: string;
};

export type Portion = {
  id: string;
  /** e.g. "Single", "Full", "Family" */
  label: string;
  /** e.g. "Serves 1" — optional, only when the restaurant confirms it. */
  serves?: string;
  /** Price in whole rupees. */
  price: number;
};

export type Badge = "bestseller" | "chef-special" | "new";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  isVeg: boolean;
  /** 0 = mild … 3 = hot. null when spice information doesn't apply. */
  spice: 0 | 1 | 2 | 3 | null;
  badges: Badge[];
  portions: Portion[];
  available: boolean;
  /** Shown in the Signature Collection showcase. */
  signature: boolean;
  image: string;
  imageAlt: string;
};

export type Fulfilment = "delivery" | "pickup";

export type CartLine = {
  itemId: string;
  portionId: string;
  qty: number;
};

export type QuoteRequest = {
  lines: CartLine[];
  fulfilment: Fulfilment;
  pincode?: string;
  promoCode?: string;
};

export type PricedLine = CartLine & {
  name: string;
  portionLabel: string;
  isVeg: boolean;
  unitPrice: number;
  lineTotal: number;
};

export type LineProblem = {
  itemId: string;
  portionId: string;
  reason: "not-found" | "unavailable" | "invalid-quantity";
  message: string;
};

export type Quote = {
  lines: PricedLine[];
  problems: LineProblem[];
  subtotal: number;
  discount: number;
  promo: { code: string; label: string } | null;
  promoError: string | null;
  deliveryFee: number;
  tax: number;
  taxLabel: string;
  total: number;
  delivery: {
    /** null when no pincode has been checked yet. */
    available: boolean | null;
    message: string | null;
  };
  minimumOrder: number | null;
  meetsMinimum: boolean;
  /** True when the order can be placed as quoted. */
  orderable: boolean;
};

export type OrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out-for-delivery"
  | "completed"
  | "cancelled";

export type CustomerDetails = {
  name: string;
  phone: string;
  email?: string;
};

export type DeliveryAddress = {
  line1: string;
  line2?: string;
  landmark?: string;
  pincode: string;
};

export type PaymentMethod = "pay-on-delivery" | "pay-at-counter";

export type Order = {
  id: string;
  /** Secret used in the tracking link so order IDs can't be enumerated. */
  token: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  fulfilment: Fulfilment;
  customer: CustomerDetails;
  address: DeliveryAddress | null;
  notes?: string;
  payment: { method: PaymentMethod; status: "unpaid" | "paid" };
  quote: Omit<Quote, "problems" | "orderable" | "promoError">;
  demo: boolean;
};

/** Customer-safe view of an order (no token). */
export type PublicOrder = Omit<Order, "token">;

export type EnquiryType = "catering" | "reservation";

export type Enquiry = {
  id: string;
  type: EnquiryType;
  createdAt: string;
  status: "new" | "contacted" | "closed";
  name: string;
  phone: string;
  email?: string;
  date?: string;
  time?: string;
  guests?: number;
  occasion?: string;
  service?: string;
  notes?: string;
};

export type FieldErrors = Record<string, string>;
