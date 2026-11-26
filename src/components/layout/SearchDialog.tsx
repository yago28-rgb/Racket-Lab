"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { getAllRackets, getFeaturedRackets, emptyFilters, filterRackets } from "@/lib/catalog";
import { mainPhoto } from "@/lib/media";
import { brands } from "@/data/brands";
import { formatPrice, fmtHead, fmtWeight } from "@/lib/format";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => (q.trim() ? filterRackets(getAllRackets(), { ...emptyFilters, q }).slice(0, 7) : getFeaturedRackets()), [q]);

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
          className="fixed inset-0 z-[70] flex items-start justify-center bg-night/40 px-4 pt-[10vh] backdrop-blur-md"
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
            className="w-full max-w-2xl overflow-hidden rounded-[24px] bg-paper shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)]"
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
                className="h-16 flex-1 bg-transparent text-[19px] outline-none placeholder:text-muted focus-visible:outline-none"
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
              {!q.trim() && <li className="px-4 pb-1 pt-3 text-[11px] uppercase tracking-[0.18em] text-stone">La selección</li>}
              {results.map((r, i) => (
                <li key={r.id} role="option" aria-selected={i === active}>
                  <Link
                    href={`/raquetas/${r.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(`/raquetas/${r.slug}`);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center justify-between gap-4 rounded-2xl px-3 py-2.5 transition-colors ${i === active ? "bg-mist" : ""}`}
                  >
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-mist">
                      {mainPhoto(r) && <Image src={mainPhoto(r)!} alt="" fill sizes="48px" className="object-contain p-1 mix-blend-multiply" />}
                    </span>
                    <span className="flex-1">
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
                    className="mt-1 flex w-full items-center justify-between rounded-2xl border-t border-line px-4 py-4 text-left hover:bg-mist"
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
