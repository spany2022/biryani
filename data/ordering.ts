/**
 * Ordering rules used by the server-side pricing engine.
 *
 * SAMPLE VALUES — confirm tax treatment, fees, delivery area and offers with the
 * restaurant (and its accountant) before taking real orders.
 */

export type PromoCode = {
  code: string;
  label: string;
  percentOff: number;
  maxDiscount: number;
  minSubtotal: number;
};

export const ordering = {
  /**
   * "demo": orders are stored locally, no payment is taken and nothing reaches a kitchen.
   * Switch to "live" only once a real kitchen workflow (and, if needed, payments) is wired up.
   */
  mode: "demo" as "demo" | "live",
  currency: "INR",
  taxRate: 0.05,
  taxLabel: "GST (5%)",
  maxQtyPerLine: 20,
  delivery: {
    fee: 49,
    freeAbove: 999,
    minimumOrder: 299,
    /** Pincodes the kitchen delivers to. Sample Hyderabad pincodes. */
    pincodes: ["500001", "500004", "500016", "500028", "500033", "500034", "500082", "500081"],
    estimate: "45–60 min",
  },
  pickup: {
    estimate: "25–35 min",
  },
  promoCodes: [
    { code: "DEMO10", label: "Demo offer — 10% off", percentOff: 10, maxDiscount: 150, minSubtotal: 500 },
  ] satisfies PromoCode[],
  /** Online payment provider. null = not configured; checkout offers pay-on-delivery / at-counter only. */
  onlinePayments: null as null | { provider: string },
};
