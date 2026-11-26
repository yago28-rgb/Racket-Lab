"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { useOrders, type OrderStatus } from "@/store/orders";
import { formatEUR } from "@/lib/format";
import { useHydrated } from "@/hooks/useHydrated";

const statusLabel: Record<OrderStatus, string> = {
  demo: "Demostración · sin cobro",
  paid: "Pagado",
  "pending-payment": "Pago pendiente",
};

export function OrdersView() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  if (!hydrated) return <div className="container-rl h-64" />;
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Aún no hay pedidos"
        accent="en este navegador."
        text="Cuando completes una compra aparecerá aquí con su estado y su resumen."
        primary={{ href: "/raquetas", label: "Ver raquetas" }}
        image="/media/video/hero-forehand-poster.webp"
        alt="Primer plano de una derecha a contraluz"
      />
    );
  }
  return (
    <div className="container-rl pb-28">
      <ul className="divide-y divide-line border-y border-line">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/checkout/confirmacion?order=${o.id}`} className="grid gap-2 py-5 hover:bg-mist sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8 sm:px-3">
              <span>
                <span className="font-mono text-sm">{o.id}</span>
                <span className="block text-xs text-muted">
                  {new Date(o.createdAt).toLocaleString("es-ES")} · {o.lines.reduce((n, l) => n + l.quantity, 0)} artículos
                </span>
              </span>
              <span className="text-sm text-muted">{statusLabel[o.status]}</span>
              <span className="font-medium tabular-nums">{formatEUR(o.total)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted">
        Historial guardado en este navegador. Con Stripe y una base de datos conectados, los pedidos se registran en el servidor desde el webhook.
      </p>
    </div>
  );
}
