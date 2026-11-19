"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { getAllRackets, emptyFilters, filterRackets } from "@/lib/catalog";
import { brands } from "@/data/brands";
import { formatPrice, fmtHead, fmtWeight } from "@/lib/format";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => (q.trim() ? filterRackets(getAllRackets(), { ...emptyFilters, q }).slice(0, 7) : []), [q]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const go = (href: string) => {
    onClose();
    setQ("");
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/30 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en el catálogo"
        >
          <motion.div
            initial={{ y: -12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -12, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (results[active]) go(`/raquetas/${results[active].slug}`);
                else if (q.trim()) go(`/raquetas?q=${encodeURIComponent(q.trim())}`);
              }}
              className="flex items-center gap-3 border-b border-line px-5"
            >
              <Search size={18} className="text-muted" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(results.length - 1, a + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(0, a - 1));
                  }
                }}
                placeholder="Busca por marca o modelo: Blade, Pure Aero, Speed…"
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
                aria-label="Término de búsqueda"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-results"
              />
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">ESC</kbd>
            </form>
            <ul id="search-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
              {q.trim() && results.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-muted">Sin resultados para «{q}».</li>
              )}
              {results.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === active}>
                  <Link
                    href={`/raquetas/${r.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(`/raquetas/${r.slug}`);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${i === active ? "bg-cloud" : ""}`}
                  >
                    <span>
                      <span className="text-[11px] text-muted">{brands[r.brand].name}</span>
                      <span className="block text-sm font-medium">
                        {r.model} {r.generation}
                      </span>
                    </span>
                    <span className="text-right text-xs text-muted">
                      {fmtWeight(r.specs.weightUnstrungG)} · {fmtHead(r.specs.headSizeSqIn)}
                      <span className="block text-ink">{formatPrice(r.price.amount)}</span>
                    </span>
                  </Link>
                </li>
              ))}
              {!q.trim() && (
                <li>
                  <button
                    type="button"
                    onClick={() => go("/racket-finder")}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left hover:bg-cloud"
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <Sparkles size={16} /> ¿No sabes qué buscar? Prueba el Racket Finder
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
