"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, AlertTriangle } from "lucide-react";
import { useOrders } from "@/store/orders";
import { useCart } from "@/store/cart";
import { formatEUR } from "@/lib/format";
import { shippingConfig } from "@/lib/shipping";
import { ButtonLink } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";

export function ConfirmationView() {
  const hydrated = useHydrated();
  const sp = useSearchParams();
  const orderId = sp.get("order");
  const sessionId = sp.get("session_id");
  const order = useOrders((s) => s.orders.find((o) => o.id === orderId));
  const updateStatus = useOrders((s) => s.updateStatus);
  const clear = useCart((s) => s.clear);
  const [checking, setChecking] = useState(Boolean(sessionId));

  useEffect(() => {
    if (!sessionId || !orderId) return;
    fetch(`/api/checkout/session?id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "paid") {
          updateStatus(orderId, "paid");
          clear();
        }
      })
      .finally(() => setChecking(false));
  }, [sessionId, orderId, updateStatus, clear]);

  if (!hydrated || checking) return <div className="container-rl py-32 text-center text-muted">Comprobando el pedido…</div>;

  if (!order) {
    return (
      <div className="container-rl py-32 text-center">
        <p className="text-lg font-medium">No encontramos este pedido en este navegador.</p>
        <div className="mt-6">
          <ButtonLink href="/pedidos">Ver mis pedidos</ButtonLink>
        </div>
      </div>
    );
  }

  const isDemo = order.status === "demo";
  const pending = order.status === "pending-payment";

  return (
    <div className="container-rl max-w-2xl py-32">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className={`flex h-16 w-16 items-center justify-center rounded-full ${pending ? "bg-amber-100" : "bg-ink"} text-white`}
      >
        {pending ? <AlertTriangle className="text-amber-700" /> : <Check size={28} />}
      </motion.div>
      <h1 className="display mt-8 text-[clamp(2.2rem,5vw,3.75rem)]">
        {pending ? "Pago pendiente." : isDemo ? "Pedido de demostración registrado." : "Gracias. Pedido confirmado."}
      </h1>
      <p className="mt-4 text-ink/70">
        {isDemo
          ? "No se ha realizado ningún cobro: la tienda está en modo demostración. El pedido se ha guardado solo en este navegador."
          : pending
            ? "Stripe aún no ha confirmado el pago. Si lo has completado, la confirmación llegará en unos minutos."
            : `Te enviaremos la confirmación a ${order.email}.`}
      </p>
      <dl className="mt-10 space-y-2 rounded-[var(--radius-card)] bg-mist p-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Número de pedido</dt>
          <dd className="font-mono">{order.id}</dd>
        </div>
        {order.lines.map((l) => (
          <div key={`${l.racketId}${l.grip}${l.stringing}`} className="flex justify-between gap-4">
            <dt>
              {l.quantity} × {l.name} · {l.grip}
              {l.stringing ? " · encordada" : ""}
            </dt>
            <dd>{formatEUR(l.unitPrice * l.quantity)}</dd>
          </div>
        ))}
        <div className="flex justify-between">
          <dt className="text-muted">Envío ({shippingConfig.zones[order.zone].label})</dt>
          <dd>{order.shipping === 0 ? "Gratis" : formatEUR(order.shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatEUR(order.total)}</dd>
        </div>
      </dl>
      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/pedidos" variant="secondary">
          Mis pedidos
        </ButtonLink>
        <ButtonLink href="/raquetas">Seguir comprando</ButtonLink>
      </div>
    </div>
  );
}
