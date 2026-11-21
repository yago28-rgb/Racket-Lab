"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useCompare, MAX_COMPARE } from "@/store/compare";
import { getRacketById } from "@/lib/catalog";
import { useHydrated } from "@/hooks/useHydrated";
import { buttonClass } from "@/components/ui/Button";

export function CompareBar() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const ids = useCompare((s) => s.ids);
  const remove = useCompare((s) => s.remove);
  const show = hydrated && ids.length > 0 && !pathname.startsWith("/comparar") && !pathname.startsWith("/checkout");
  const items = ids.map(getRacketById).filter((r) => r != null);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
        >
          <div className="flex w-full max-w-2xl items-center gap-3 rounded-full border border-cream/10 bg-club/95 py-2 pl-5 pr-2 text-white shadow-2xl backdrop-blur-xl">
            <span className="hidden text-xs text-white/60 sm:inline">
              Comparar {items.length}/{MAX_COMPARE}
            </span>
            <ul className="flex flex-1 gap-2 overflow-x-auto">
              {items.map((r) => (
                <li key={r.id} className="flex shrink-0 items-center gap-1 rounded-full bg-paper/10 py-1 pl-3 pr-1 text-xs">
                  {r.model}
                  <button onClick={() => remove(r.id)} aria-label={`Quitar ${r.model}`} className="rounded-full p-1 hover:bg-paper/15">
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/comparar" className={buttonClass("inverted", "sm")}>
              Comparar
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
