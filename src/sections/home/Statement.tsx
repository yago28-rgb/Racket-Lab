"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TEXT =
  "Diez gramos. Tres milímetros de balance. Cuatro puntos de rigidez. Así de pequeña es la distancia entre una buena raqueta y la tuya.";

/** One sentence, read at the pace of the scroll: each word lights up in turn. */
export function Statement({ models, brands }: { models: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: "[data-statement]", start: "top 78%", end: "bottom 45%", scrub: 0.6 },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="bg-paper px-5 pb-32 pt-24 md:px-[6vw] md:pb-48 md:pt-36">
      <p
        data-statement
        aria-label={TEXT}
        className="mx-auto max-w-[20ch] text-center text-[clamp(2.2rem,5.4vw,5rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-ink"
      >
        {TEXT.split(" ").map((w, i) => (
          <span key={i} data-word aria-hidden className="inline">
            {w}{" "}
          </span>
        ))}
      </p>
      <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-4 text-center md:mt-16">
        <p className="text-[17px] leading-relaxed text-muted">
          {models} raquetas de {brands} marcas. Cada peso, balance y patrón está contrastado con su fuente; lo que no hemos podido
          confirmar aparece como pendiente.
        </p>
        <Link href="/#tecnologia" className="group inline-flex items-center gap-0.5 text-[17px] text-club hover:underline">
          Cómo leemos una raqueta <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
