"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { Racket } from "@/types/product";
import { ProductMedia } from "./ProductMedia";
import { productPhotos } from "@/lib/media";
import { fullRacketName } from "@/lib/format";

/**
 * The racket laid on the diagonal so it fills the card. It swings into place
 * when the card enters the viewport and turns a few degrees on hover; a
 * second real photo of the same model opens as a material detail.
 */
export function CardMedia({ racket, index = 0, sizes, wide = false }: { racket: Racket; index?: number; sizes: string; wide?: boolean }) {
  const reduced = useReducedMotion();
  const photos = productPhotos(racket);
  const detail = photos[2] ?? photos[1];
  if (!photos.length) return <ProductMedia racket={racket} sizes={sizes} />;
  return (
    <>
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { rotate: wide ? -80 : -62, scale: 0.86, opacity: 0 }}
        whileInView={{ rotate: wide ? -62 : -38, scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.3, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`absolute transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:rotate-[10deg] group-hover:scale-[1.06] ${wide ? "inset-x-[24%] inset-y-[-4%]" : "inset-[2%]"}`}
        >
          {/* Same colour as the card, inside the transformed layer, so the multiply blend still dissolves the white studio background. */}
          <div className="absolute inset-[-60%] bg-mist" />
          <ProductMedia racket={racket} sizes={sizes} className="!p-[2%]" />
        </div>
      </motion.div>
      {detail && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 h-24 w-24 scale-75 overflow-hidden rounded-full bg-paper opacity-0 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100">
          <Image src={detail} alt={`Detalle de ${fullRacketName(racket)}`} fill sizes="96px" className="scale-[2.4] object-cover object-[50%_35%]" />
        </div>
      )}
    </>
  );
}
