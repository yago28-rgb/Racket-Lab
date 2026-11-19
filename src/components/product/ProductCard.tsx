import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Racket } from "@/types/product";
import { brands } from "@/data/brands";
import { fmtBalance, fmtHead, fmtWeight, formatPrice, levelRange, typeLabels } from "@/lib/format";
import { ProductMedia } from "./ProductMedia";
import { CompareToggle } from "./CompareToggle";

export function ProductCard({ racket, uid = "card" }: { racket: Racket; uid?: string }) {
  const s = racket.specs;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
      <Link href={`/raquetas/${racket.slug}`} className="absolute inset-0 z-10" aria-label={`Ver ${brands[racket.brand].name} ${racket.model} ${racket.generation}`} />
      <div className="studio-bg relative aspect-[4/5] overflow-hidden">
        <div className="absolute inset-0 p-6 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]">
          <ProductMedia racket={racket} uid={uid} angle={-22} />
        </div>
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium backdrop-blur">{typeLabels[racket.type]}</span>
        </div>
        <div className="absolute right-4 top-4 z-20">
          <CompareToggle id={racket.id} label={false} className="h-8 w-8 justify-center !p-0" />
        </div>
        {!racket.image && (
          <span className="absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.14em] text-muted">Ilustración</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow !text-[10px]">{brands[racket.brand].name}</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              {racket.model} <span className="font-normal text-muted">{racket.generation}</span>
            </h3>
          </div>
          <ArrowUpRight className="mt-1 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" size={18} />
        </div>
        <dl className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt className="text-muted">Peso</dt>
            <dd className="mt-0.5 font-medium">{fmtWeight(s.weightUnstrungG)}</dd>
          </div>
          <div>
            <dt className="text-muted">Cabeza</dt>
            <dd className="mt-0.5 font-medium">{fmtHead(s.headSizeSqIn)}</dd>
          </div>
          <div>
            <dt className="text-muted">Balance</dt>
            <dd className="mt-0.5 font-medium">{s.balanceUnstrungMm ? `${s.balanceUnstrungMm} mm` : fmtBalance(null)}</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-[11px] text-muted">{levelRange(racket.levels)}</p>
            <p className={racket.price.amount == null ? "mt-0.5 text-sm text-muted" : "mt-0.5 text-base font-semibold"}>
              {formatPrice(racket.price.amount)}
            </p>
          </div>
          <span className="relative z-20 text-sm font-medium underline-offset-4 group-hover:underline">Detalles</span>
        </div>
      </div>
    </article>
  );
}
