import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <section className="container-rl pb-10 pt-32 md:pt-36">
        <h1 className="display text-[clamp(2.4rem,6vw,4.5rem)]">Carrito.</h1>
      </section>
      <CartView />
    </>
  );
}
