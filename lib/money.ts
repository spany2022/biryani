const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** Formats whole rupees, e.g. 1149 → "₹1,149". */
export const formatPrice = (rupees: number) => inr.format(rupees);

/** Lowest portion price, used for "from ₹…" labels. */
export const fromPrice = (portions: { price: number }[]) =>
  portions.length ? Math.min(...portions.map((p) => p.price)) : 0;
