"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, WordReveal } from "@/components/ui/Reveal";

/**
 * Editorial block. In place of stock photography (none licensed yet), the
 * visual is a macro study of a 16×19 string bed rendered in SVG.
 */
export function Philosophy({ models, brandCount }: { models: number; brandCount: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [reduced ? -8 : -18, reduced ? -8 : 6]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.05, 1.15]);

  return (
    <section id="filosofia" ref={ref} className="bg-white py-28 md:py-40">
      <div className="container-rl grid items-center gap-16 md:grid-cols-2">
        <div>
          <p className="eyebrow">Filosofía</p>
          <h2 className="display mt-6 text-[clamp(2.4rem,5.5vw,4.75rem)]">
            <WordReveal text={"Every player is different.\nYour racket should be too."} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/65">
              Diez gramos, unos milímetros de balance o tres puntos de rigidez cambian cómo sale la bola. Por eso cada raqueta
              de RACKET LAB se presenta con sus especificaciones verificadas, sus fuentes y lo que significan para tu juego.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                [String(models), "modelos verificados"],
                [String(brandCount), "marcas"],
                ["10", "factores en el Racket Finder"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-3xl font-semibold tracking-tight">{n}</dd>
                  <dd className="mt-1 text-xs text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="relative">
          <figure className="noir-bg relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <motion.svg style={{ rotate, scale }} viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <radialGradient id="ph-light" cx="65%" cy="30%" r="70%">
                  <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
                </radialGradient>
              </defs>
              {Array.from({ length: 16 }).map((_, i) => (
                <rect key={`m${i}`} x={20 + i * 24} y={-40} width={3.2} height={580} rx={1.6} fill="url(#ph-light)" />
              ))}
              {Array.from({ length: 19 }).map((_, i) => (
                <rect key={`c${i}`} x={-40} y={10 + i * 26} width={480} height={3.2} rx={1.6} fill="url(#ph-light)" opacity={0.75} />
              ))}
            </motion.svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <figcaption className="absolute bottom-6 left-6 right-6 text-white">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Estudio · patrón 16×19</p>
              <p className="mt-2 text-sm text-white/80">16 cuerdas verticales, 19 horizontales. Cada cruce cuenta.</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
