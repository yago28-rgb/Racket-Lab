import { getRacketById, isPurchasable } from "@/lib/catalog";
import { racketName } from "@/lib/format";
import { shippingConfig, shippingCost, type ShippingZone } from "@/lib/shipping";
import type { Racket } from "@/types/product";

export interface PricedLine {
  key: string;
  racket: Racket;
  name: string;
  grip: string;
  stringing: boolean;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartTotals {
  lines: PricedLine[];
  /** Lines removed because the product no longer exists or has no confirmed price. */
  invalid: string[];
  subtotal: number;
  shipping: number;
  total: number;
}

interface LineInput {
  key?: string;
  racketId: string;
  grip: string;
  stringing: boolean;
  quantity: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Single source of truth for cart maths. Used by the client UI and re-run on the
 * server before creating a payment, so client-side prices are never trusted.
 */
export function priceCart(input: LineInput[], zone: ShippingZone): CartTotals {
  const lines: PricedLine[] = [];
  const invalid: string[] = [];
  for (const l of input) {
    const r = getRacketById(l.racketId);
    const qty = Math.max(0, Math.min(10, Math.floor(l.quantity)));
    if (!r || !isPurchasable(r) || qty === 0) {
      invalid.push(l.racketId);
      continue;
    }
    const unit = round((r.price.amount as number) + (l.stringing ? shippingConfig.stringingService.price : 0));
    lines.push({
      key: l.key ?? `${l.racketId}|${l.grip}|${l.stringing ? "s" : "u"}`,
      racket: r,
      name: racketName(r),
      grip: l.grip,
      stringing: l.stringing,
      quantity: qty,
      unitPrice: unit,
      lineTotal: round(unit * qty),
    });
  }
  const subtotal = round(lines.reduce((s, l) => s + l.lineTotal, 0));
  const shipping = shippingCost(subtotal, zone);
  return { lines, invalid, subtotal, shipping, total: round(subtotal + shipping) };
}
