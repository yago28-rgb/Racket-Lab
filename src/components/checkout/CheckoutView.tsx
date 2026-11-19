"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";
import { priceCart } from "@/lib/pricing";
import { formatEUR } from "@/lib/format";
import { shippingConfig } from "@/lib/shipping";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";

type PaymentMode = "demo" | "test" | "live" | null;

const fields = [
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: 2 },
  { name: "name", label: "Nombre y apellidos", type: "text", autoComplete: "name", span: 2 },
  { name: "address", label: "Dirección", type: "text", autoComplete: "street-address", span: 2 },
  { name: "postalCode", label: "Código postal", type: "text", autoComplete: "postal-code", span: 1, inputMode: "numeric", pattern: "\\d{4,6}" },
  { name: "city", label: "Ciudad", type: "text", autoComplete: "address-level2", span: 1 },
] as const;

export function CheckoutView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const sp = useSearchParams();
  const { lines, zone, clear } = useCart();
  const addOrder = useOrders((s) => s.addOrder);
  const totals = priceCart(lines, zone);
  const [mode, setMode] = useState<PaymentMode>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(sp.get("cancelled") ? "Pago cancelado. Tu carrito se ha conservado." : null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => setMode(c.payments))
      .catch(() => setMode("demo"));
  }, []);

  if (!hydrated) return <div className="container-rl h-96" />;

  if (totals.lines.length === 0) {
    return (
      <div className="container-rl py-24 text-center">
        <p className="text-lg font-medium">No hay nada que pagar.</p>
        <div className="mt-6">
          <ButtonLink href="/raquetas">Ver raquetas</ButtonLink>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const customer = Object.fromEntries(fields.map((f) => [f.name, String(fd.get(f.name) ?? "").trim()])) as Record<(typeof fields)[number]["name"], string>;
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines.map(({ racketId, grip, stringing, quantity }) => ({ racketId, grip, stringing, quantity })), zone, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se ha podido procesar el pedido.");
      addOrder({
        id: data.orderId,
        createdAt: new Date().toISOString(),
        status: data.mode === "demo" ? "demo" : "pending-payment",
        ...customer,
        zone,
        lines: data.lines,
        subtotal: data.totals.subtotal,
        shipping: data.totals.shipping,
        total: data.totals.total,
        stripeSessionId: data.sessionId,
      });
      if (data.mode === "demo") {
        clear();
        router.push(`/checkout/confirmacion?order=${data.orderId}`);
      } else {
        window.location.assign(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setSubmitting(false);
    }
  };

  return (
    <div className="container-rl grid gap-12 pb-28 lg:grid-cols-[1fr_400px]">
      <form onSubmit={onSubmit} className="space-y-8" noValidate={false}>
        {mode === "demo" && (
          <div className="flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>
              <strong>Modo demostración.</strong> No hay credenciales de Stripe configuradas: el pedido se registrará en este navegador
              y <strong>no se realizará ningún cobro</strong>. Consulta el README para activar Stripe en modo test.
            </p>
          </div>
        )}
        {mode === "test" && (
          <div className="rounded-2xl border border-line bg-mist p-4 text-sm">
            <strong>Stripe en modo test.</strong> Usa la tarjeta 4242 4242 4242 4242 con cualquier fecha futura y CVC.
          </div>
        )}
        <fieldset>
          <legend className="text-lg font-semibold tracking-tight">Datos de envío</legend>
          <p className="mt-1 text-sm text-muted">Envío a {shippingConfig.zones[zone].label}. Puedes cambiar el destino en el carrito.</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {fields.map((f) => (
              <label key={f.name} className={f.span === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <span className="text-sm font-medium">{f.label}</span>
                <input
                  name={f.name}
                  type={f.type}
                  required
                  autoComplete={f.autoComplete}
                  inputMode={"inputMode" in f ? f.inputMode : undefined}
                  pattern={"pattern" in f ? f.pattern : undefined}
                  className="mt-2 h-12 w-full rounded-xl border border-line px-4 outline-none transition-colors focus:border-ink user-invalid:border-red-500"
                />
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={submitting || mode === null}>
          <Lock size={16} />
          {submitting ? "Procesando…" : mode === "demo" ? `Confirmar pedido de demostración · ${formatEUR(totals.total)}` : `Pagar ${formatEUR(totals.total)}`}
        </Button>
        <p className="text-center text-xs text-muted">
          Al continuar aceptas nuestra{" "}
          <Link href="/privacidad" className="underline underline-offset-4">
            política de privacidad
          </Link>{" "}
          y las{" "}
          <Link href="/envios" className="underline underline-offset-4">
            condiciones de envío y devolución
          </Link>
          .
        </p>
      </form>

      <aside className="h-fit rounded-[var(--radius-card)] bg-mist p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold tracking-tight">Tu pedido</h2>
        <ul className="mt-5 space-y-4">
          {totals.lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-4 text-sm">
              <span>
                {l.quantity} × {l.name} {l.racket.generation}
                <span className="block text-xs text-muted">
                  {l.grip} · {l.stringing ? "Encordada" : "Sin encordar"}
                </span>
              </span>
              <span className="tabular-nums">{formatEUR(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatEUR(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Envío</dt>
            <dd>{totals.shipping === 0 ? "Gratis" : formatEUR(totals.shipping)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatEUR(totals.total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
