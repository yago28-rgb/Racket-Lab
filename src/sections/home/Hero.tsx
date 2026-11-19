"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { Racket } from "@/types/product";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

/**
 * Hero render uses a neutral RACKET LAB studio colourway on a parametric
 * 100 in² / 16×19 frame: it represents the brand, not a specific product.
 */
const studioRacket: Racket = {
  id: "studio",
  slug: "studio",
  brand: "head",
  family: "Studio",
  model: "Studio",
  variant: "",
  generation: "",
  price: { amount: null, compareAt: null, note: "" },
  specs: {
    weightUnstrungG: 300,
    headSizeSqIn: 100,
    balanceUnstrungMm: 320,
    pattern: { mains: 16, crosses: 19 },
    stiffnessRA: 65,
    swingweight: 320,
    lengthIn: 27,
    beamMm: "23",
    tensionRangeKg: null,
  },
  image: null,
  gallery: [],
  colorway: { frame: "#141416", accent: "#2b2b2e", grip: "#0e0e0f", strings: "#e9e9e6" },
  type: "all-round",
  levels: [],
  styles: [],
  description: "",
  technologies: [],
  availability: "pending",
  purchaseUrl: null,
  dataNotes: [],
  sources: [],
  verifiedAt: "",
};

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "18%"]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.88]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="studio-bg relative flex min-h-[100svh] flex-col overflow-hidden pt-14" aria-labelledby="hero-title">
      {/* Subtle court geometry */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]" aria-hidden>
        <defs>
          <linearGradient id="hl" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.6" stopColor="#000" stopOpacity="0.06" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="50%" x2="50%" y1="0" y2="100%" stroke="url(#hl)" />
        <line x1="0" x2="100%" y1="78%" y2="78%" stroke="#000" strokeOpacity="0.05" />
      </svg>

      <motion.div style={{ y: textY, opacity: fade }} className="container-rl relative z-10 flex flex-col justify-start pt-[6vh] md:flex-1 md:justify-center md:pt-0">
        <motion.p
          className="eyebrow"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
        >
          Premium tennis equipment · España & Europa
        </motion.p>
        <h1 id="hero-title" className="display mt-5 text-[clamp(3.2rem,9vw,8.5rem)]">
          {["YOUR GAME.", "YOUR RACKET."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={`block ${i === 1 ? "text-ink/35" : ""}`}
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.25 + i * 0.12, ease }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="mt-6 max-w-sm text-lg text-ink/70 md:text-xl"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease }}
        >
          Find the racket that plays like you.
        </motion.p>
        <motion.div
          className="mt-9 flex flex-wrap gap-3"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease }}
        >
          <ButtonLink href="/raquetas" size="lg">
            Explore rackets
          </ButtonLink>
          <ButtonLink href="/racket-finder" size="lg" variant="secondary">
            Find your racket
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div style={{ y: sceneY, scale: sceneScale }} className="relative h-[52svh] w-full md:absolute md:inset-auto md:bottom-0 md:left-[48%] md:right-0 md:top-14 md:h-auto">
        <motion.div
          className="h-full w-full"
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease }}
        >
          <HeroScene racket={studioRacket} />
        </motion.div>
      </motion.div>

      <motion.a
        href="#filosofia"
        style={{ opacity: fade }}
        className="relative z-10 mx-auto mb-8 hidden flex-col md:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted"
        aria-label="Desplázate para descubrir más"
      >
        Scroll
        <span className="flex h-9 w-5 justify-center rounded-full border border-ink/20 pt-1.5">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-ink/60"
            animate={reduced ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <ArrowDown size={12} className="sr-only" />
      </motion.a>
    </section>
  );
}
