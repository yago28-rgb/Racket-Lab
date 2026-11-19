"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { priceCart } from "@/lib/pricing";
import { formatEUR, cn } from "@/lib/format";
import { shippingConfig, type ShippingZone } from "@/lib/shipping";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { CartLineItem } from "./CartLineItem";
import { useHydrated } from "@/hooks/useHydrated";

export function CartView() {
  const hydrated = useHydrated();
  const { lines, zone, setZone } = useCart();
  const totals = priceCart(lines, zone);

  if (!hydrated) return <div className="container-rl h-96" />;

  if (totals.lines.length === 0) {
    return (
      <div className="container-rl flex flex-col items-center py-24 text-center">
        <ShoppingBag size={36} className="text-muted" />
        <p className="mt-6 text-lg font-medium">Tu carrito está vacío.</p>
        <p className="mt-2 text-sm text-muted">Explora el catálogo o deja que el Racket Finder elija por ti.</p>
        <div className="mt-8 flex gap-3">
          <ButtonLink href="/raquetas">Ver raquetas</ButtonLink>
          <ButtonLink href="/racket-finder" variant="secondary">
            Racket Finder
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="container-rl grid gap-12 pb-28 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-line border-y border-line">
        {totals.lines.map((l) => (
          <CartLineItem key={l.key} line={l} />
        ))}
      </ul>
      <aside className="h-fit rounded-[var(--radius-card)] bg-mist p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold tracking-tight">Resumen</h2>
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Destino</legend>
          <div className="mt-3 grid gap-2">
            {(Object.keys(shippingConfig.zones) as ShippingZone[]).map((z) => {
              const conf = shippingConfig.zones[z];
              return (
                <label key={z} className={cn("flex cursor-pointer items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm", zone === z ? "border-ink" : "border-line")}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="zone" checked={zone === z} onChange={() => setZone(z)} className="accent-[#111]" />
                    <span>
                      {conf.label}
                      <span className="block text-xs text-muted">
                        {conf.eta} · gratis desde {formatEUR(conf.freeFrom)}
                      </span>
                    </span>
                  </span>
                  <span>{formatEUR(conf.cost)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatEUR(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Envío</dt>
            <dd>{totals.shipping === 0 ? "Gratis" : formatEUR(totals.shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatEUR(totals.total)}</dd>
          </div>
          <p className="text-xs text-muted">IVA incluido.</p>
        </dl>
        <Link href="/checkout" className={buttonClass("primary", "lg", "mt-6 w-full")}>
          Finalizar compra
        </Link>
      </aside>
    </div>
  );
}
