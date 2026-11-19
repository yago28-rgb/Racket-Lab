"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import type { Racket } from "@/types/product";
import { useCart } from "@/store/cart";
import { isPurchasable } from "@/lib/catalog";
import { formatEUR, cn } from "@/lib/format";
import { shippingConfig } from "@/lib/shipping";
import { gripAdvice } from "@/lib/recommendation/strings";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CompareToggle } from "./CompareToggle";

const grips = ["L1", "L2", "L3", "L4", "L5"] as const;

export function AddToCart({ racket }: { racket: Racket }) {
  const add = useCart((s) => s.add);
  const [grip, setGrip] = useState<(typeof grips)[number] | null>(null);
  const [stringing, setStringing] = useState(false);
  const [added, setAdded] = useState(false);
  const [showGrip, setShowGrip] = useState(false);
  const purchasable = isPurchasable(racket);

  if (!purchasable) {
    return (
      <div className="space-y-4 rounded-2xl border border-line bg-mist p-5">
        <p className="text-sm font-medium">Precio y disponibilidad por confirmar</p>
        <p className="text-sm text-muted">
          Todavía no hemos verificado un precio público en euros para este modelo, así que no lo vendemos hasta confirmarlo.
          Puedes compararlo o pedirnos información.
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/contacto?producto=${encodeURIComponent(racket.slug)}`} variant="primary">
            Solicitar información
          </ButtonLink>
          <CompareToggle id={racket.id} className="!h-11 !px-5 !text-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium">Talla de empuñadura</legend>
          <button type="button" onClick={() => setShowGrip((v) => !v)} className="flex items-center gap-1 text-xs text-muted hover:text-ink" aria-expanded={showGrip}>
            <Info size={13} /> ¿Cuál es mi talla?
          </button>
        </div>
        {showGrip && <p className="mt-2 rounded-xl bg-mist p-3 text-xs leading-relaxed text-ink/70">{gripAdvice}</p>}
        <div className="mt-3 grid grid-cols-5 gap-2">
          {grips.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={grip === g}
              onClick={() => setGrip(g)}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium transition-colors",
                grip === g ? "border-ink bg-ink text-white" : "border-line hover:border-ink/50",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 transition-colors has-[:checked]:border-ink">
        <input type="checkbox" checked={stringing} onChange={(e) => setStringing(e.target.checked)} className="mt-1 accent-[#111]" />
        <span className="text-sm">
          <span className="font-medium">
            {shippingConfig.stringingService.label} (+{formatEUR(shippingConfig.stringingService.price)})
          </span>
          <span className="mt-0.5 block text-muted">Te contactamos tras la compra para acordar cuerda y tensión. Sin él, la raqueta se envía sin encordar.</span>
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          className="flex-1"
          disabled={!grip}
          onClick={() => {
            if (!grip) return;
            add({ racketId: racket.id, grip, stringing });
            setAdded(true);
            setTimeout(() => setAdded(false), 2200);
          }}
        >
          {added ? (
            <>
              <Check size={18} /> Añadida
            </>
          ) : grip ? (
            "Añadir al carrito"
          ) : (
            "Elige tu empuñadura"
          )}
        </Button>
        <CompareToggle id={racket.id} className="!h-14 !px-6 !text-sm" />
      </div>
      <p className="text-xs text-muted">
        Envío {shippingConfig.zones.ES.eta} en España peninsular · gratis desde {formatEUR(shippingConfig.zones.ES.freeFrom)}.
      </p>
    </div>
  );
}
