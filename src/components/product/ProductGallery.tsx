"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Box, Image as ImageIcon } from "lucide-react";
import type { Racket } from "@/types/product";
import { ProductMedia } from "./ProductMedia";
import { cn } from "@/lib/format";

const ProductViewer = dynamic(() => import("@/components/three/ProductViewer"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-muted">Cargando visor 3D…</div>,
});

export function ProductGallery({ racket }: { racket: Racket }) {
  const [mode, setMode] = useState<"image" | "3d">("image");
  return (
    <div className="studio-bg relative aspect-square overflow-hidden rounded-[2rem] md:aspect-[4/5]">
      <AnimatePresence mode="wait">
        {mode === "image" ? (
          <motion.div
            key="img"
            className="absolute inset-0 p-10 md:p-14"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductMedia racket={racket} uid="pdp" angle={-18} priority sizes="(min-width: 1024px) 50vw, 100vw" />
          </motion.div>
        ) : (
          <motion.div key="3d" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProductViewer racket={racket} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 rounded-full border border-line bg-white/80 p-1 backdrop-blur" role="tablist" aria-label="Modo de visualización">
        {[
          { id: "image" as const, label: racket.image ? "Foto" : "Ilustración", icon: ImageIcon },
          { id: "3d" as const, label: "3D", icon: Box },
        ].map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={mode === t.id}
            onClick={() => setMode(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
              mode === t.id ? "bg-ink text-white" : "text-ink/70 hover:text-ink",
            )}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>
      <p className="absolute left-5 top-5 max-w-[60%] text-[10px] uppercase leading-relaxed tracking-[0.14em] text-muted">
        {mode === "3d"
          ? "Modelo paramétrico: cabeza, perfil y patrón a escala. Arrastra para girar."
          : racket.image
            ? ""
            : "Ilustración a escala · fotografía oficial pendiente"}
      </p>
    </div>
  );
}
