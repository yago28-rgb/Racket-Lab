import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <section className="container-rl pb-10 pt-32 md:pt-36">
        <h1 className="display text-[clamp(2.4rem,6vw,4.5rem)]">Finalizar <span className="font-serif font-normal italic text-muted">compra.</span></h1>
      </section>
      <Suspense fallback={<div className="container-rl h-96" />}>
        <CheckoutView />
      </Suspense>
    </>
  );
}
