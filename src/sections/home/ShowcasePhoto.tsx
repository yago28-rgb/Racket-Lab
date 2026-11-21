"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import type { Racket } from "@/types/product";
import { ProductMedia } from "@/components/product/ProductMedia";
import { cn } from "@/lib/format";

/**
 * The racket rises and straightens as its tile crosses the viewport, like a
 * product being turned towards you on a counter.
 *
 * The motion is applied to the image itself through CSS variables: wrapping
 * it in a transformed element would isolate it and break the multiply blend
 * that dissolves the photo's white studio background into the tile colour.
 */
export function ShowcasePhoto({ racket, className, priority, sizes, tilt = -9 }: { racket: Racket; className?: string; priority?: boolean; sizes: string; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const y = useTransform(p, [0, 0.5, 1], reduced ? ["0px", "0px", "0px"] : ["90px", "0px", "-50px"]);
  const r = useTransform(p, [0, 0.5, 1], reduced ? ["0deg", "0deg", "0deg"] : [`${tilt}deg`, "0deg", `${tilt * -0.3}deg`]);
  const s = useTransform(p, [0, 0.5, 1], reduced ? [1, 1, 1] : [0.92, 1, 0.97]);

  return (
    <motion.div ref={ref} style={{ "--y": y, "--r": r, "--s": s } as never} className={cn("relative [--lift:0px] group-hover:[--lift:-10px]", className)}>
      <ProductMedia
        racket={racket}
        priority={priority}
        sizes={sizes}
        className="transition-[translate] duration-700 ease-[var(--ease-out-expo)] [transform:translateY(var(--y))_rotate(var(--r))_scale(var(--s))] [translate:0_var(--lift)]"
      />
    </motion.div>
  );
}
