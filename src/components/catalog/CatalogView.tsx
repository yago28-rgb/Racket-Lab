"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import {
  balanceBucketLabels,
  emptyFilters,
  filterRackets,
  getAllRackets,
  headBucketLabels,
  priceBucketLabels,
  weightBucketLabels,
  type CatalogFilters,
  type SortKey,
} from "@/lib/catalog";
import { brandList } from "@/data/brands";
import { levelLabels, styleLabels, typeLabels, cn } from "@/lib/format";
import { ProductCard } from "@/components/product/ProductCard";
import { Button, ButtonLink } from "@/components/ui/Button";

type ArrayKey = Exclude<keyof CatalogFilters, "q" | "sort">;

const groups: { key: ArrayKey; title: string; options: Record<string, string>; param: string }[] = [
  { key: "brands", param: "brand", title: "Marca", options: Object.fromEntries(brandList.map((b) => [b.id, b.name])) },
  { key: "types", param: "type", title: "Tipo de raqueta", options: typeLabels },
  { key: "levels", param: "level", title: "Nivel", options: levelLabels },
  { key: "styles", param: "style", title: "Estilo de juego", options: styleLabels },
  { key: "weight", param: "weight", title: "Peso sin encordar", options: weightBucketLabels },
  { key: "head", param: "head", title: "Tamaño de cabeza", options: headBucketLabels },
  { key: "balance", param: "balance", title: "Balance", options: balanceBucketLabels },
  { key: "price", param: "price", title: "Precio", options: priceBucketLabels },
];

const sorts: Record<SortKey, string> = {
  featured: "Destacadas",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
  "weight-asc": "Peso: más ligeras",
  "weight-desc": "Peso: más pesadas",
  name: "Nombre",
};

function parse(sp: URLSearchParams): CatalogFilters {
  const f: CatalogFilters = { ...emptyFilters, q: sp.get("q") ?? "", sort: (sp.get("sort") as SortKey) ?? "featured" };
  if (!(f.sort in sorts)) f.sort = "featured";
  for (const g of groups) {
    const raw = sp.get(g.param);
    (f[g.key] as string[]) = raw ? raw.split(",").filter((v) => v in g.options) : [];
  }
  return f;
}

function serialize(f: CatalogFilters): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  for (const g of groups) if (f[g.key].length) sp.set(g.param, f[g.key].join(","));
  if (f.sort !== "featured") sp.set("sort", f.sort);
  return sp.toString();
}

export function CatalogView() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const urlFilters = useMemo(() => parse(new URLSearchParams(sp.toString())), [sp]);
  // The search box is local state (instant results), synced to the URL with a debounce.
  const [q, setQ] = useState(urlFilters.q);
  const [seenUrlQ, setSeenUrlQ] = useState(urlFilters.q);
  if (urlFilters.q !== seenUrlQ) {
    setSeenUrlQ(urlFilters.q);
    setQ(urlFilters.q);
  }
  const filters = useMemo(() => ({ ...urlFilters, q }), [urlFilters, q]);
  const results = useMemo(() => filterRackets(getAllRackets(), filters), [filters]);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(debounce.current), []);
  const activeCount = groups.reduce((n, g) => n + filters[g.key].length, 0) + (filters.q ? 1 : 0);

  const update = (next: CatalogFilters) => {
    if (next.q !== q) {
      setQ(next.q);
      setSeenUrlQ(next.q);
    }
    const qs = serialize(next);
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const toggle = (key: ArrayKey, value: string) => {
    const arr = filters[key] as string[];
    update({ ...filters, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  };

  const panel = (
    <div className="space-y-8">
      {groups.map((g) => (
        <fieldset key={g.key}>
          <legend className="text-xs font-semibold">{g.title}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(g.options).map(([value, label]) => {
              const on = (filters[g.key] as string[]).includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(g.key, value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[13px] transition-colors",
                    on ? "border-club bg-club text-cream" : "border-line bg-paper hover:border-ink/40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );

  return (
    <div className="container-rl pb-28">
      {/* Toolbar */}
      <div className="sticky top-14 z-30 -mx-5 mb-8 flex flex-wrap items-center gap-3 border-b border-line bg-paper/85 px-5 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search size={16} className="pointer-events-none absolute left-3.5 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              clearTimeout(debounce.current);
              debounce.current = setTimeout(() => {
                setSeenUrlQ(v);
                update({ ...urlFilters, q: v });
              }, 250);
            }}
            placeholder="Buscar modelo o marca"
            className="h-10 w-full rounded-full border border-line bg-paper pl-10 pr-4 text-sm outline-none focus:border-ink"
            aria-label="Buscar en el catálogo"
          />
        </label>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm lg:hidden"
        >
          <SlidersHorizontal size={15} /> Filtros {activeCount > 0 && <span className="rounded-full bg-ink px-1.5 text-[11px] text-white">{activeCount}</span>}
        </button>
        <select
          value={filters.sort}
          onChange={(e) => update({ ...filters, sort: e.target.value as SortKey })}
          className="h-10 rounded-full border border-line bg-paper px-4 text-sm outline-none focus:border-ink"
          aria-label="Ordenar"
        >
          {Object.entries(sorts).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <p className="w-full text-xs text-muted md:w-auto" aria-live="polite">
          {results.length} {results.length === 1 ? "raqueta" : "raquetas"}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pb-10 pr-2">
            {panel}
            {activeCount > 0 && (
              <button onClick={() => update(emptyFilters)} className="mt-8 text-sm underline underline-offset-4">
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line px-6 py-24 text-center">
              <p className="text-lg font-medium">Ninguna raqueta coincide con estos filtros.</p>
              <p className="mt-2 max-w-sm text-sm text-muted">
                Prueba a quitar alguno, o deja que el Racket Finder encuentre la tuya a partir de tu forma de jugar.
              </p>
              <div className="mt-8 flex gap-3">
                <Button variant="secondary" onClick={() => update(emptyFilters)}>
                  Limpiar filtros
                </Button>
                <ButtonLink href="/racket-finder">Racket Finder</ButtonLink>
              </div>
            </div>
          ) : (
            <motion.ul layout className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {results.map((r, i) => (
                  <motion.li
                    key={r.id}
                    layout
                    className={i % 5 === 0 ? "sm:col-span-2" : undefined}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ProductCard racket={r} index={i} size={i % 5 === 0 ? "lg" : "md"} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-paper"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="font-semibold">Filtros</h2>
                <button onClick={() => setMobileOpen(false)} aria-label="Cerrar filtros" className="rounded-full p-2 hover:bg-cloud">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">{panel}</div>
              <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
                <Button variant="secondary" onClick={() => update(emptyFilters)}>
                  Limpiar
                </Button>
                <Button onClick={() => setMobileOpen(false)}>Ver {results.length} resultados</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
