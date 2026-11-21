"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Reveal, WordReveal } from "@/components/ui/Reveal";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { videos } from "@/lib/media";
import { NumberTicker } from "@/components/ui/motion-kit";

export function Philosophy({ models, brandCount }: { models: number; brandCount: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], reduced ? [1, 1, 1] : [1.18, 1.06, 1.12]);

  return (
    <section id="filosofia" ref={ref} className="bg-paper py-28 md:py-40">
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
              {(
                [
                  [models, "modelos verificados"],
                  [brandCount, "marcas"],
                  [10, "factores en el Racket Finder"],
                ] as const
              ).map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-3xl font-semibold tracking-tight">
                    <NumberTicker value={n} />
                  </dd>
                  <dd className="mt-1 text-xs text-muted">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal className="relative">
          <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-night">
            <motion.div style={{ y, scale }} className="absolute inset-0">
              <BackgroundVideo base={videos.playerReady.base} label={videos.playerReady.label} />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <figcaption className="absolute bottom-6 left-6 right-6 text-white">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Posición de resto</p>
              <p className="mt-2 text-sm text-white/85">Peso adelantado, raqueta preparada. La raqueta correcta empieza aquí.</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
