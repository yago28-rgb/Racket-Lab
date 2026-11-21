"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "motion/react";
import { getAllRackets } from "@/lib/catalog";
import { maxBeam } from "@/lib/recommendation/profile";
import { balancePoints, cn } from "@/lib/format";
import { brands } from "@/data/brands";
import { mainPhoto } from "@/lib/media";
import type { Racket } from "@/types/product";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ChapterId = "frame" | "pattern" | "weight" | "head" | "balance" | "swingweight" | "materials";

interface Chapter {
  id: ChapterId;
  kicker: string;
  title: string;
  body: string;
  facts: [string, string][];
  /** Numeric value per racket for the live catalogue chart (null = not verified). */
  metric?: { label: string; unit: string; get: (r: Racket) => number | null; min: number; max: number; desc?: boolean };
}

const chapters: Chapter[] = [
  {
    id: "frame",
    kicker: "Frame technology",
    title: "El perfil decide la potencia.",
    body: "Un marco más ancho (perfil o beam) y más rígido se deforma menos en el impacto y devuelve más energía a la bola. Un perfil fino flexa más: menos potencia gratuita, más sensación y control.",
    facts: [
      ["21–22 mm", "perfil de control"],
      ["24–27 mm", "perfil de potencia"],
    ],
    metric: { label: "Perfil máximo", unit: "mm", get: (r) => maxBeam(r.specs.beamMm), min: 19, max: 27, desc: true },
  },
  {
    id: "pattern",
    kicker: "String pattern",
    title: "Más espacio, más efecto.",
    body: "En un patrón abierto (16×19, 16×18) las cuerdas verticales se desplazan y vuelven a su sitio, lo que ayuda a generar efecto. Un patrón denso (18×19, 18×20) da una respuesta más predecible y precisa.",
    facts: [
      ["16×19", "abierto, versátil"],
      ["18×20", "denso, precisión"],
    ],
  },
  {
    id: "weight",
    kicker: "Weight distribution",
    title: "Masa es estabilidad.",
    body: "Más peso estático resiste mejor el impacto de bolas rápidas y transmite menos vibración, pero exige más al brazo. El peso se mide sin encordar: cordaje y grip añaden unos 15–20 g.",
    facts: [
      ["< 285 g", "manejable"],
      ["≥ 305 g", "estable"],
    ],
    metric: { label: "Peso sin encordar", unit: "g", get: (r) => r.specs.weightUnstrungG, min: 280, max: 320, desc: true },
  },
  {
    id: "head",
    kicker: "Head size",
    title: "Tolerancia frente a precisión.",
    body: "Una cabeza mayor amplía el punto dulce y añade potencia; una menor concentra la respuesta y premia la técnica.",
    facts: [
      ["97–98 in²", "midsize"],
      ["100 in²", "estándar actual"],
    ],
    metric: { label: "Tamaño de cabeza", unit: "in²", get: (r) => r.specs.headSizeSqIn, min: 95, max: 101 },
  },
  {
    id: "balance",
    kicker: "Balance",
    title: "Dónde está el centro de masa.",
    body: "Se mide desde el puño. En una raqueta de 27″ el punto neutro está a 343 mm; cada 3,175 mm hacia el puño es un «punto» head light (HL). Más HL = más manejable en la red.",
    facts: [
      ["320 mm", "≈ 7 pts HL"],
      ["343 mm", "neutro"],
    ],
    metric: {
      label: "Puntos hacia el puño (HL)",
      unit: "pts",
      get: (r) => (r.specs.balanceUnstrungMm == null ? null : balancePoints(r.specs.balanceUnstrungMm)),
      min: 4,
      max: 11,
      desc: true,
    },
  },
  {
    id: "swingweight",
    kicker: "Swingweight",
    title: "Lo que sientes al acelerar.",
    body: "Es la resistencia de la raqueta a girar alrededor de un eje situado a 10 cm del puño (kg·cm²). Un swingweight alto da estabilidad y peso de bola; uno bajo facilita la aceleración y las reacciones rápidas.",
    facts: [
      ["≈ 310", "rápida"],
      ["≈ 330", "estable"],
    ],
    metric: { label: "Swingweight (encordada)", unit: "", get: (r) => r.specs.swingweight, min: 300, max: 335, desc: true },
  },
  {
    id: "materials",
    kicker: "Materials",
    title: "Grafito, y lo que lo acompaña.",
    body: "El grafito es la base de casi todos los marcos actuales. Los fabricantes añaden fibras (basalto, aramida, lino) o estructuras propias para filtrar vibraciones o ajustar la flexión. Solo mostramos las tecnologías que hemos podido verificar.",
    facts: [
      ["Grafito", "base estructural"],
      ["Fibras", "amortiguación"],
    ],
  },
];

function Thumb({ r }: { r: Racket }) {
  const src = mainPhoto(r);
  return (
    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-paper/90">
      {src ? (
        <Image src={src} alt="" fill sizes="36px" className="object-contain p-0.5 mix-blend-multiply" />
      ) : (
        <span className="flex h-full items-center justify-center text-[9px] font-semibold text-ink/40">{brands[r.brand].name.slice(0, 2)}</span>
      )}
    </span>
  );
}

function Panel({ chapter }: { chapter: Chapter }) {
  const all = getAllRackets();
  const rows = useMemo(() => {
    const m = chapter.metric;
    if (!m) return [];
    return all
      .map((r) => ({ r, v: m.get(r) }))
      .filter((x): x is { r: Racket; v: number } => x.v != null)
      .sort((a, b) => (m.desc ? b.v - a.v : a.v - b.v));
  }, [all, chapter]);

  if (chapter.id === "pattern") {
    const groups = new Map<string, Racket[]>();
    for (const r of all) {
      if (!r.specs.pattern) continue;
      const k = `${r.specs.pattern.mains}×${r.specs.pattern.crosses}`;
      groups.set(k, [...(groups.get(k) ?? []), r]);
    }
    return (
      <div className="space-y-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Patrones en el catálogo</p>
        {[...groups.entries()]
          .sort((a, b) => b[1].length - a[1].length)
          .map(([k, list]) => (
            <div key={k}>
              <p className="flex items-baseline gap-3">
                <span className="text-3xl font-semibold tracking-tight">{k}</span>
                <span className="text-sm text-white/50">{list.length} raquetas</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {list.map((r) => (
                  <li key={r.id}>
                    <Link href={`/raquetas/${r.slug}`} className="flex items-center gap-2 rounded-full border border-white/10 bg-paper/[0.04] py-1 pl-1 pr-3 text-xs hover:border-white/40">
                      <Thumb r={r} /> {r.model}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    );
  }

  if (chapter.id === "materials") {
    const withTech = all.filter((r) => r.technologies.length);
    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Tecnologías verificadas</p>
        <ul className="mt-5 space-y-3">
          {withTech.map((r) => (
            <li key={r.id} className="flex items-center gap-3">
              <Thumb r={r} />
              <span className="w-40 shrink-0 text-sm">
                {brands[r.brand].name} {r.model}
              </span>
              <span className="flex flex-wrap gap-1.5">
                {r.technologies.map((t) => (
                  <span key={t} className="rounded-full bg-paper/10 px-2.5 py-1 text-[11px] text-white/80">
                    {t}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-white/40">
          {all.length - withTech.length} modelos sin tecnologías verificadas con el fabricante: no las mostramos.
        </p>
      </div>
    );
  }

  const m = chapter.metric!;
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
        {m.label} · {rows.length} de {all.length} modelos con dato verificado
      </p>
      <ul className="mt-5 space-y-2">
        {rows.map(({ r, v }, i) => (
          <motion.li
            key={r.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025, duration: 0.4 }}
            className="grid grid-cols-[36px_minmax(0,9.5rem)_1fr_3.5rem] items-center gap-3 text-xs"
          >
            <Thumb r={r} />
            <Link href={`/raquetas/${r.slug}`} className="truncate text-white/80 hover:text-white">
              {r.model} <span className="text-white/40">{r.generation}</span>
            </Link>
            <span className="h-1.5 overflow-hidden rounded-full bg-paper/10">
              <motion.span
                className="block h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, Math.min(100, ((v - m.min) / (m.max - m.min)) * 100))}%` }}
                transition={{ delay: 0.1 + i * 0.025, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
            <span className="text-right tabular-nums text-white/80">
              {v}
              {m.unit && <span className="text-white/40"> {m.unit}</span>}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function Technology() {
  const section = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState<ChapterId>("frame");

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setCurrent(el.dataset.chapter as ChapterId);
          },
        });
        gsap.from(el.querySelectorAll("[data-reveal]"), {
          opacity: 0,
          y: 24,
          stagger: 0.08,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 75%" },
        });
      });
    },
    { scope: section },
  );

  const chapter = chapters.find((c) => c.id === current)!;

  return (
    <section ref={section} id="tecnologia" className="noir-bg relative scroll-mt-14 text-white" aria-labelledby="tech-title">
      <div className="container-rl pt-24 md:pt-32">
        <p className="eyebrow !text-white/50">Tecnología</p>
        <h2 id="tech-title" className="display mt-6 max-w-3xl text-[clamp(2.4rem,5.5vw,4.75rem)]">
          Siete números que explican una raqueta.
        </h2>
        <p className="mt-6 max-w-xl text-white/55">Cada capítulo muestra los datos reales de nuestro catálogo, raqueta por raqueta.</p>
      </div>

      <div className="container-rl grid pb-24 lg:grid-cols-2 lg:gap-16">
        <div className="sticky top-14 z-20 order-first -mx-5 h-[46svh] md:-mx-10 lg:order-last lg:mx-0 lg:top-[12svh] lg:z-0 lg:h-[76svh]">
          <div className="relative h-full overflow-y-auto overscroll-contain border border-white/10 bg-night/95 p-6 backdrop-blur lg:rounded-[2rem] lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Panel chapter={chapter} />
              </motion.div>
            </AnimatePresence>
          </div>
          <ol className="pointer-events-none absolute right-5 top-5 flex gap-1.5" aria-hidden>
            {chapters.map((c) => (
              <li key={c.id} className={cn("h-1 rounded-full transition-all duration-500", c.id === current ? "w-6 bg-accent" : "w-1.5 bg-paper/25")} />
            ))}
          </ol>
        </div>

        <div className="relative">
          {chapters.map((c) => (
            <article key={c.id} data-chapter={c.id} className="flex min-h-[60svh] flex-col justify-center py-10 lg:min-h-[70svh]">
              <p data-reveal className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {c.kicker}
              </p>
              <h3 data-reveal className="display mt-4 text-4xl md:text-6xl">
                {c.title}
              </h3>
              <p data-reveal className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">
                {c.body}
              </p>
              <dl data-reveal className="mt-8 flex gap-10">
                {c.facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-2xl font-semibold tracking-tight">{k}</dt>
                    <dd className="text-sm text-white/50">{v}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
