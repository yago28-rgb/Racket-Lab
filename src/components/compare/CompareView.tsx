"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCompare, MAX_COMPARE } from "@/store/compare";
import { getAllRackets, getRacketById } from "@/lib/catalog";
import { catalogueProfiles } from "@/lib/recommendation/profile";
import { brands } from "@/data/brands";
import { formatPrice, cn } from "@/lib/format";
import { specRows } from "@/components/product/SpecTable";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProfileBars } from "@/components/product/ProfileBars";
import { ButtonLink } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";
import type { Racket } from "@/types/product";

const profiles = catalogueProfiles(getAllRackets());



/** Numeric spec extractors used to highlight the extreme value in each row. */
const numeric: Record<string, (r: Racket) => number | null> = {
  "Peso sin encordar": (r) => r.specs.weightUnstrungG,
  "Tamaño de cabeza": (r) => r.specs.headSizeSqIn,
  "Balance sin encordar": (r) => r.specs.balanceUnstrungMm,
  Rigidez: (r) => r.specs.stiffnessRA,
  Swingweight: (r) => r.specs.swingweight,
};

export function CompareView() {
  const hydrated = useHydrated();
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const remove = useCompare((s) => s.remove);
  const items = hydrated ? ids.map(getRacketById).filter((r): r is Racket => r != null) : [];
  const candidates = getAllRackets().filter((r) => !ids.includes(r.id));

  if (!hydrated) return <div className="container-rl h-96" />;

  return (
    <div className="container-rl pb-28">
      {items.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line px-6 py-16 text-center">
          <p className="text-lg font-medium">Aún no has elegido raquetas para comparar.</p>
          <p className="mt-2 text-sm text-muted">Añade hasta {MAX_COMPARE} desde el selector de abajo, el catálogo o el resultado del Racket Finder.</p>
        </div>
      )}

      {items.length > 0 && (
        <>
          {/* Table */}
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">Comparativa de especificaciones</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-44 p-0" />
                  {items.map((r) => (
                    <th key={r.id} scope="col" className="p-3 text-left align-top font-normal">
                      <div className="studio-bg relative aspect-[4/5] overflow-hidden rounded-2xl">
                        <ProductMedia racket={r} sizes="240px" />
                        <button onClick={() => remove(r.id)} className="absolute right-3 top-3 rounded-full bg-paper/80 p-1.5 backdrop-blur hover:bg-paper" aria-label={`Quitar ${r.model}`}>
                          <X size={14} />
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-muted">{brands[r.brand].name}</p>
                      <Link href={`/raquetas/${r.slug}`} className="font-semibold hover:underline">
                        {r.model} <span className="font-normal text-muted">{r.generation}</span>
                      </Link>
                      <p className="mt-1">{formatPrice(r.price.amount)}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specRows(items[0]).map(([label], rowIdx) => {
                  const fn = numeric[label];
                  const vals = fn ? items.map(fn) : [];
                  const valid = vals.filter((v): v is number => v != null);
                  const max = valid.length > 1 ? Math.max(...valid) : null;
                  const min = valid.length > 1 ? Math.min(...valid) : null;
                  return (
                    <tr key={label} className="border-t border-line">
                      <th scope="row" className="py-3.5 pr-4 text-left font-normal text-muted">
                        {label}
                      </th>
                      {items.map((r, i) => {
                        const v = specRows(r)[rowIdx][1];
                        const n = vals[i];
                        const extreme = n != null && max !== min && (n === max || n === min);
                        return (
                          <td key={r.id} className={cn("px-3 py-3.5 tabular-nums", v === "Pendiente" ? "italic text-muted" : "font-medium")}>
                            {v}
                            {extreme && <span className="ml-2 align-middle text-[10px] text-muted">{n === max ? "▲ mayor" : "▼ menor"}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="border-t border-line">
                  <th scope="row" className="py-5 pr-4 text-left align-top font-normal text-muted">
                    Perfil de juego
                  </th>
                  {items.map((r) => (
                    <td key={r.id} className="px-3 py-5 align-top">
                      <ProfileBars profile={profiles.get(r.id)!.values} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {items.length < MAX_COMPARE && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold tracking-tight">Añadir raqueta ({items.length}/{MAX_COMPARE})</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {candidates.map((r) => (
              <li key={r.id}>
                <button onClick={() => toggle(r.id)} className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-sm hover:border-ink">
                  <Plus size={13} /> {brands[r.brand].name} {r.model} <span className="text-muted">{r.generation}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16">
        <ButtonLink href="/racket-finder" variant="secondary">
          ¿Dudas? Usa el Racket Finder
        </ButtonLink>
      </div>
    </div>
  );
}
