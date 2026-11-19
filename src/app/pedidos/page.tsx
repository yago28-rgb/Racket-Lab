import type { Metadata } from "next";
import { OrdersView } from "@/components/checkout/OrdersView";

export const metadata: Metadata = { title: "Mis pedidos", robots: { index: false } };

export default function OrdersPage() {
  return (
    <>
      <section className="container-rl pb-10 pt-32 md:pt-36">
        <h1 className="display text-[clamp(2.4rem,6vw,4.5rem)]">Mis pedidos.</h1>
      </section>
      <OrdersView />
    </>
  );
}
