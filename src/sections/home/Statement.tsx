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
        { opacity: 0.14 },
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
        className="max-w-[22ch] font-serif text-[clamp(2.3rem,5.6vw,5.6rem)] font-medium leading-[1.02] tracking-[-0.02em] text-club"
      >
        {TEXT.split(" ").map((w, i) => (
          <span key={i} data-word aria-hidden className="inline">
            {w}{" "}
          </span>
        ))}
      </p>
      <div className="mt-14 flex flex-col gap-4 md:ml-[38%] md:mt-20 md:max-w-md">
        <p className="text-[17px] leading-relaxed text-ink/70">
          {models} raquetas de {brands} marcas. Cada peso, balance y patrón está contrastado con su fuente; lo que no hemos podido
          confirmar aparece como pendiente.
        </p>
        <Link href="/#tecnologia" className="group inline-flex items-center gap-1 text-[17px] font-medium text-club hover:text-accent-ink">
          Cómo leemos una raqueta <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
