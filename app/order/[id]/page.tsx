import type { Metadata } from "next";
import Link from "next/link";
import { timingSafeEqual } from "node:crypto";
import OrderStatus from "@/components/checkout/OrderStatus";
import { getOrder } from "@/lib/store";
import type { PublicOrder } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const { t } = await searchParams;
  const token = typeof t === "string" ? t : "";
  const order = await getOrder(id);
  const valid =
    order !== null && token.length === order.token.length && timingSafeEqual(Buffer.from(token), Buffer.from(order.token));

  return (
    <main id="main" tabIndex={-1} className="on-light min-h-screen bg-cream px-5 pb-24 pt-32 text-ink md:px-10">
      {valid ? (
        <OrderStatus initial={toPublic(order)} token={token} />
      ) : (
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-5 text-center">
          <h1 className="font-serif text-5xl">Order not found</h1>
          <p className="text-ink/70">
            The link may be incomplete. Use the full link from your order confirmation, or get in touch with us.
          </p>
          <Link href="/" className="rounded-full bg-ink px-6 py-3 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-cream">
            Go home
          </Link>
        </div>
      )}
    </main>
  );
}

function toPublic(order: NonNullable<Awaited<ReturnType<typeof getOrder>>>): PublicOrder {
  const copy: Partial<typeof order> = { ...order };
  delete copy.token;
  return copy as PublicOrder;
}
