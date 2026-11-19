"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { racketDims, hoopOutline, stringLines, toPath } from "@/lib/racket-geometry";

interface Chapter {
  id: string;
  kicker: string;
  title: string;
  body: string;
  facts: [string, string][];
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
  },
  {
    id: "head",
    kicker: "Head size",
    title: "Tolerancia frente a precisión.",
    body: "Una cabeza mayor amplía el punto dulce y añade potencia; una menor concentra la respuesta y premia la técnica. Abajo, a escala real relativa: 97, 100 y 105 in².",
    facts: [
      ["97–98 in²", "midsize"],
      ["100 in²", "estándar actual"],
    ],
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
  },
  {
    id: "swingweight",
    kicker: "Swingweight",
    title: "Lo que sientes al acelerar.",
    body: "Es la resistencia de la raqueta a girar alrededor del puño (kg·cm²). Un swingweight alto da estabilidad y peso de bola; uno bajo facilita la aceleración y las reacciones rápidas.",
    facts: [
      ["≈ 310", "rápida"],
      ["≈ 330", "estable"],
    ],
  },
  {
    id: "materials",
    kicker: "Materials",
    title: "Grafito, y lo que lo acompaña.",
    body: "El grafito es la base de casi todos los marcos actuales. Los fabricantes añaden fibras (basalto, aramida, lino) o estructuras propias para filtrar vibraciones o ajustar la flexión. En cada ficha indicamos solo las tecnologías que hemos podido verificar.",
    facts: [
      ["Grafito", "base estructural"],
      ["Fibras", "amortiguación"],
    ],
  },
];

function Visual({ id }: { id: string }) {
  const d100 = racketDims(100, 23);
  const common = "h-full w-full";
  switch (id) {
    case "frame":
      return (
        <svg viewBox="0 0 200 200" className={common}>
          {[
            { x: 50, w: 21, label: "21 mm" },
            { x: 130, w: 27, label: "27 mm" },
          ].map((b) => (
            <g key={b.x}>
              <rect x={b.x - b.w / 2} y={30} width={b.w} height={120} rx={b.w / 2.2} fill="url(#tg)" />
              <text x={b.x} y={175} textAnchor="middle" className="fill-white/60 font-mono text-[9px]">
                {b.label}
              </text>
            </g>
          ))}
        </svg>
      );
    case "pattern":
      return (
        <div className="grid h-full w-full grid-cols-2 gap-6 p-4">
          {[
            [16, 19],
            [18, 20],
          ].map(([m, c]) => {
            const d = racketDims(100, 23);
            const l = stringLines(d, m, c);
            return (
              <svg key={m} viewBox={`${-d.bOut - 0.3} ${d.headCY - d.aOut - 0.3} ${(d.bOut + 0.3) * 2} ${(d.aOut + 0.3) * 2}`} className="h-full w-full">
                <g transform={`translate(0 ${2 * d.headCY}) scale(1 -1)`}>
                  {[...l.mains, ...l.crosses].map((s, i) => (
                    <line key={i} x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} stroke="#fff" strokeOpacity="0.75" strokeWidth="0.05" />
                  ))}
                  <path d={toPath(hoopOutline(d))} fill="#2a2a2d" />
                </g>
                <text x="0" y={d.headCY + d.aOut + 0.1} textAnchor="middle" className="fill-white/60 font-mono" fontSize="1">
                  {m}×{c}
                </text>
              </svg>
            );
          })}
        </div>
      );
    case "head":
      return (
        <svg viewBox="-8 -9 17 18" className={common}>
          {[105, 100, 97].map((h, i) => {
            const d = racketDims(h, 23);
            return (
              <g key={h}>
                <ellipse cx="0" cy="0" rx={d.bIn} ry={d.aIn} fill="none" stroke={i === 1 ? "#c8f031" : "#fff"} strokeOpacity={i === 1 ? 1 : 0.45} strokeWidth="0.06" />
                <line x1={d.bIn} x2={6.6} y1={-1.6 + i * 1.6} y2={-1.6 + i * 1.6} stroke="#fff" strokeOpacity="0.25" strokeWidth="0.03" />
                <text x="6.7" y={-1.45 + i * 1.6} className="fill-white/70 font-mono" fontSize="0.5">
                  {h}
                </text>
              </g>
            );
          })}
          <text x="0" y="8.4" textAnchor="middle" className="fill-white/60 font-mono" fontSize="0.6">
            105 · 100 · 97 in²
          </text>
        </svg>
      );
    case "balance":
    case "weight":
    case "swingweight": {
      const pivot = id === "balance" ? 0.47 : id === "swingweight" ? 0.06 : 0.47;
      return (
        <svg viewBox="0 0 300 200" className={common}>
          <rect x="20" y="96" width="260" height="8" rx="4" fill="#2a2a2d" />
          <ellipse cx="230" cy="100" rx="48" ry="36" fill="none" stroke="#3a3a3e" strokeWidth="9" />
          <polygon points={`${20 + 260 * pivot - 10},128 ${20 + 260 * pivot + 10},128 ${20 + 260 * pivot},106`} fill="#c8f031" />
          {id === "swingweight" && (
            <motion.path
              d="M 60 60 A 80 80 0 0 1 240 60"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.5"
              strokeWidth="2"
              strokeDasharray="4 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4 }}
            />
          )}
          {id === "weight" && (
            <text x="150" y="170" textAnchor="middle" className="fill-white/60 font-mono text-[10px]">
              300 g sin encordar + ~17 g
            </text>
          )}
          {id === "balance" && (
            <text x="150" y="170" textAnchor="middle" className="fill-white/60 font-mono text-[10px]">
              punto de equilibrio · 320 mm
            </text>
          )}
          {id === "swingweight" && (
            <text x="150" y="170" textAnchor="middle" className="fill-white/60 font-mono text-[10px]">
              giro alrededor del puño · kg·cm²
            </text>
          )}
        </svg>
      );
    }
    default:
      return (
        <svg viewBox={`${-d100.bOut - 1} ${d100.headCY - d100.aOut - 1} ${(d100.bOut + 1) * 2} ${(d100.aOut + 1) * 2}`} className={common}>
          <defs>
            <pattern id="weave" width="0.6" height="0.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="0.3" height="0.6" fill="#ffffff" fillOpacity="0.14" />
            </pattern>
          </defs>
          <g transform={`translate(0 ${2 * d100.headCY}) scale(1 -1)`}>
            <path d={toPath(hoopOutline(d100))} fill="#1d1d20" />
            <path d={toPath(hoopOutline(d100))} fill="url(#weave)" />
          </g>
        </svg>
      );
  }
}

function ChapterBlock({ c, onActive }: { c: Chapter; onActive: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive();
  }, [inView, onActive]);
  return (
    <div ref={ref} className="flex min-h-[60vh] flex-col justify-center py-12 lg:min-h-[75vh]">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{c.kicker}</p>
      <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">{c.title}</h3>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/60">{c.body}</p>
      <dl className="mt-8 flex gap-10">
        {c.facts.map(([k, v]) => (
          <div key={k}>
            <dt className="text-2xl font-semibold tracking-tight">{k}</dt>
            <dd className="text-sm text-white/50">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 aspect-square w-full max-w-sm rounded-3xl bg-white/[0.03] p-6 lg:hidden">
        <Visual id={c.id} />
      </div>
    </div>
  );
}

export function Technology() {
  const [active, setActive] = useState(chapters[0].id);
  return (
    <section id="tecnologia" className="noir-bg scroll-mt-14 py-24 text-white md:py-32" aria-labelledby="tech-title">
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="tg" x1="0" x2="1">
            <stop offset="0" stopColor="#1d1d20" />
            <stop offset="0.5" stopColor="#5a5a60" />
            <stop offset="1" stopColor="#1d1d20" />
          </linearGradient>
        </defs>
      </svg>
      <div className="container-rl">
        <p className="eyebrow !text-white/50">Tecnología</p>
        <h2 id="tech-title" className="display mt-6 max-w-3xl text-[clamp(2.4rem,5.5vw,4.75rem)]">
          Siete números que explican una raqueta.
        </h2>
        <div className="mt-8 grid gap-16 lg:grid-cols-2">
          <div>
            {chapters.map((c) => (
              <ChapterBlock key={c.id} c={c} onActive={() => setActive(c.id)} />
            ))}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-[15vh] flex h-[70vh] items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="h-full w-full"
                  initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Visual id={active} />
                </motion.div>
              </AnimatePresence>
              <ol className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
                {chapters.map((c) => (
                  <li key={c.id} className={`h-1 rounded-full transition-all duration-500 ${c.id === active ? "w-6 bg-accent" : "w-1.5 bg-white/25"}`} />
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
