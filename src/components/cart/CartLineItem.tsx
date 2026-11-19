"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { PricedLine } from "@/lib/pricing";
import { useCart } from "@/store/cart";
import { formatEUR } from "@/lib/format";
import { brands } from "@/data/brands";
import { ProductMedia } from "@/components/product/ProductMedia";

export function CartLineItem({ line, compact = false }: { line: PricedLine; compact?: boolean }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const close = useCart((s) => s.close);
  const r = line.racket;
  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/raquetas/${r.slug}`}
        onClick={close}
        className={`studio-bg relative shrink-0 overflow-hidden rounded-xl ${compact ? "h-24 w-20" : "h-32 w-28"}`}
      >
        <ProductMedia racket={r} sizes="112px" label={false} />
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted">{brands[r.brand].name}</p>
            <p className="font-medium leading-tight">
              {r.model} <span className="text-muted">{r.generation}</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              Empuñadura {line.grip} · {line.stringing ? "Encordada" : "Sin encordar"}
            </p>
          </div>
          <p className="text-sm font-medium">{formatEUR(line.lineTotal)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex items-center rounded-full border border-line">
            <button
              className="p-2 hover:text-ink disabled:opacity-30"
              onClick={() => setQuantity(line.key, line.quantity - 1)}
              aria-label="Reducir cantidad"
            >
              <Minus size={14} />
            </button>
            <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <button
              className="p-2 disabled:opacity-30"
              onClick={() => setQuantity(line.key, line.quantity + 1)}
              disabled={line.quantity >= 10}
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>
          <button onClick={() => remove(line.key)} className="flex items-center gap-1 text-xs text-muted hover:text-ink">
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}
