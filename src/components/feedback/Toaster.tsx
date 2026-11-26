"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useToast } from "@/store/toast";

/** Bottom-centred stack of confirmations; announced politely to assistive tech. */
export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-16 z-[80] flex flex-col items-center gap-2 px-4 md:left-auto md:right-5 md:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex w-full max-w-md items-center gap-4 rounded-2xl bg-night/95 p-3 pr-4 text-paper shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur"
          >
            {t.image && (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mist">
                <Image src={t.image} alt="" fill sizes="56px" className="object-contain p-1 mix-blend-multiply" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium">{t.title}</p>
              {t.detail && <p className="truncate text-[13px] text-paper/60">{t.detail}</p>}
            </div>
            {t.action && (
              <Link href={t.action.href} onClick={() => dismiss(t.id)} className="shrink-0 rounded-full bg-paper px-4 py-2 text-[13px] text-ink transition-colors hover:bg-white">
                {t.action.label}
              </Link>
            )}
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Cerrar aviso" className="shrink-0 text-paper/50 hover:text-paper">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
