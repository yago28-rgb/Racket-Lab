"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Racket } from "@/types/product";
import { ProductMedia } from "./ProductMedia";
import { cn, fullRacketName } from "@/lib/format";
import { productPhotos } from "@/lib/media";

/** Real product photos with thumbnails and a hover/tap loupe for detail. */
export function ProductGallery({ racket }: { racket: Racket }) {
  const photos = productPhotos(racket);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div>
      <motion.div
        initial={{ clipPath: "inset(100% 0% 0% 0% round 28px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        className={cn("relative aspect-square overflow-hidden rounded-[28px] bg-mist md:aspect-[4/5]", photos.length > 0 && "cursor-zoom-in")}
        onMouseMove={photos.length ? onMove : undefined}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={
              zoom
                ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%`, transition: "transform-origin 60ms linear" }
                : undefined
            }
          >
            {/* Card colour inside the transformed layer keeps the multiply blend working. */}
            <div className="absolute inset-0 bg-mist" />
            <ProductMedia racket={racket} index={index} priority={index === 0} sizes="(min-width: 1024px) 55vw, 100vw" className="!p-[3%]" />
          </motion.div>
        </AnimatePresence>
        {photos.length === 0 && (
          <p className="absolute inset-x-6 bottom-6 text-center text-xs text-muted">
            Añade las fotos de esta raqueta en <code>public/fotos/</code> siguiendo <code>FOTOS.md</code>.
          </p>
        )}
      </motion.div>

      {photos.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3" role="tablist" aria-label="Fotos del producto">
          {photos.map((src, i) => (
            <button
              key={src}
              role="tab"
              aria-selected={index === i}
              aria-label={`Foto ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl border bg-mist transition-colors",
                index === i ? "border-ink" : "border-transparent hover:border-line",
              )}
            >
              <Image src={src} alt={`${fullRacketName(racket)} · foto ${i + 1}`} fill sizes="120px" className="object-contain p-2 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
