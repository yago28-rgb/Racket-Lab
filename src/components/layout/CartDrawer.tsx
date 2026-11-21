"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { priceCart } from "@/lib/pricing";
import { formatEUR } from "@/lib/format";
import { shippingConfig } from "@/lib/shipping";
import { buttonClass } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { useHydrated } from "@/hooks/useHydrated";

export function CartDrawer() {
  const hydrated = useHydrated();
  const { lines, zone, isOpen, close } = useCart();
  const totals = priceCart(lines, zone);
  const free = shippingConfig.zones[zone].freeFrom;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!hydrated) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={close} aria-hidden />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="text-lg font-semibold tracking-tight">Tu carrito</h2>
              <button onClick={close} className="rounded-full p-2 hover:bg-cloud" aria-label="Cerrar carrito">
                <X size={18} />
              </button>
            </div>

            {totals.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <ShoppingBag size={32} className="text-muted" />
                <p className="text-sm text-muted">Tu carrito está vacío.</p>
                <Link href="/raquetas" onClick={close} className={buttonClass("primary", "md")}>
                  Explorar raquetas
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6">
                  {subtotalHint(totals.subtotal, free)}
                  <ul className="divide-y divide-line">
                    {totals.lines.map((l) => (
                      <CartLineItem key={l.key} line={l} compact />
                    ))}
                  </ul>
                </div>
                <div className="space-y-3 border-t border-line px-6 py-5">
                  <Row label="Subtotal" value={formatEUR(totals.subtotal)} />
                  <Row label={`Envío · ${shippingConfig.zones[zone].label}`} value={totals.shipping === 0 ? "Gratis" : formatEUR(totals.shipping)} />
                  <Row label="Total (IVA incl.)" value={formatEUR(totals.total)} strong />
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link href="/carrito" onClick={close} className={buttonClass("secondary", "md")}>
                      Ver carrito
                    </Link>
                    <Link href="/checkout" onClick={close} className={buttonClass("primary", "md")}>
                      Finalizar compra
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function subtotalHint(subtotal: number, free: number) {
  const left = free - subtotal;
  const pct = Math.min(100, (subtotal / free) * 100);
  return (
    <div className="py-4">
      <p className="text-xs text-muted">{left > 0 ? `Te faltan ${formatEUR(left)} para el envío gratuito.` : "Tienes envío gratuito."}</p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-club transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${strong ? "text-base font-semibold" : "text-muted"}`}>
      <span>{label}</span>
      <span className={strong ? "" : "text-ink"}>{value}</span>
    </div>
  );
}
