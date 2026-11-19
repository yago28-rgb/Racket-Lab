"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Box } from "lucide-react";
import type { Racket } from "@/types/product";
import { ProductMedia } from "./ProductMedia";
import { cn, fullRacketName } from "@/lib/format";
import { renderSrc, type RenderView } from "@/lib/media";

const ProductViewer = dynamic(() => import("@/components/three/ProductViewer"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-muted">Cargando modelo 3D…</div>,
});

type Mode = RenderView | "3d";

const views: { id: RenderView; label: string }[] = [
  { id: "hero", label: "Tres cuartos" },
  { id: "front", label: "Frontal" },
  { id: "detail", label: "Detalle del puente" },
];

export function ProductGallery({ racket }: { racket: Racket }) {
  const [mode, setMode] = useState<Mode>("hero");
  return (
    <div>
      <div className="studio-bg relative aspect-square overflow-hidden rounded-[2rem] md:aspect-[4/5]">
        <AnimatePresence mode="wait">
          {mode === "3d" ? (
            <motion.div key="3d" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProductViewer racket={racket} />
            </motion.div>
          ) : (
            <motion.div
              key={mode}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductMedia racket={racket} view={mode} priority={mode === "hero"} sizes="(min-width: 1024px) 50vw, 100vw" label={false} />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="pointer-events-none absolute bottom-4 left-4 max-w-[80%] rounded-full bg-white/75 px-3 py-1.5 text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink/60 backdrop-blur">
          {mode === "3d" ? "Modelo 3D representativo · arrastra para girar" : "Render 3D representativo · no es una foto del producto"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3" role="tablist" aria-label="Vistas del producto">
        {views.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={mode === v.id}
            aria-label={v.label}
            onClick={() => setMode(v.id)}
            className={cn(
              "studio-bg relative aspect-square overflow-hidden rounded-2xl border transition-colors",
              mode === v.id ? "border-ink" : "border-transparent hover:border-line",
            )}
          >
            <Image src={renderSrc(racket.slug, v.id)} alt={`${fullRacketName(racket)} · ${v.label}`} fill sizes="120px" className="object-contain" />
          </button>
        ))}
        <button
          role="tab"
          aria-selected={mode === "3d"}
          onClick={() => setMode("3d")}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border text-xs font-medium transition-colors",
            mode === "3d" ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/50",
          )}
        >
          <Box size={18} /> 3D
        </button>
      </div>
    </div>
  );
}
