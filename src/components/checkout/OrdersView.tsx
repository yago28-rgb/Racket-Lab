"use client";

import Link from "next/link";
import { useOrders, type OrderStatus } from "@/store/orders";
import { formatEUR } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
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
      <div className="container-rl pb-28">
        <p className="text-muted">Todavía no hay pedidos en este navegador.</p>
        <div className="mt-6">
          <ButtonLink href="/raquetas">Ver raquetas</ButtonLink>
        </div>
      </div>
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
