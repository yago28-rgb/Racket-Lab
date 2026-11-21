import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationView } from "@/components/checkout/ConfirmationView";

export const metadata: Metadata = { title: "Confirmación de pedido", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="container-rl py-32" />}>
      <ConfirmationView />
    </Suspense>
  );
}
