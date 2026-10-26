import type { Metadata } from "next";
import Checkout from "@/components/checkout/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <main id="main" tabIndex={-1} className="on-light min-h-screen bg-cream px-5 pb-24 pt-32 text-ink md:px-10">
      <Checkout />
    </main>
  );
}
