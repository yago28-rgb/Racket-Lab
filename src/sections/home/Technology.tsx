"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { TechChapterId } from "@/components/three/TechScene";
import { cn } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TechScene = dynamic(() => import("@/components/three/TechScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[2rem] bg-white/[0.03]" />,
});

interface Chapter {
  id: TechChapterId;
  kicker: string;
  title: string;
  body: string;
  facts: [string, string][];
  caption: string;
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
    caption: "Vista lateral del marco: el grosor del perfil a la altura de las 3.",
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
    caption: "Encordado 16×19 entrelazado: cada vertical pasa por encima y por debajo de las horizontales.",
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
    caption: "Raqueta completa: marco, puente, encordado, grip y tapón.",
  },
  {
    id: "head",
    kicker: "Head size",
    title: "Tolerancia frente a precisión.",
    body: "Una cabeza mayor amplía el punto dulce y añade potencia; una menor concentra la respuesta y premia la técnica. Junto a estas líneas, dos modelos del catálogo a escala real.",
    facts: [
      ["97 in²", "Pro Staff 97 v14"],
      ["100 in²", "estándar actual"],
    ],
    caption: "Izquierda: 97 in². Derecha: 100 in². Misma longitud, misma escala.",
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
    caption: "Raqueta en equilibrio sobre un fulcro a 320 mm del puño.",
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
    caption: "Oscilación alrededor de un eje a 10 cm del puño, como en una máquina de medición.",
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
    caption: "Macro: tejido de carbono en sarga bajo una capa de clearcoat.",
  },
];

export function Technology() {
  const section = useRef<HTMLElement>(null);
  const active = useRef<TechChapterId>("frame");
  const [current, setCurrent] = useState<TechChapterId>("frame");

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (!self.isActive) return;
            const id = el.dataset.chapter as TechChapterId;
            active.current = id;
            setCurrent(id);
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

  const currentChapter = chapters.find((c) => c.id === current)!;

  return (
    <section ref={section} id="tecnologia" className="noir-bg relative scroll-mt-14 text-white" aria-labelledby="tech-title">
      <div className="container-rl pt-24 md:pt-32">
        <p className="eyebrow !text-white/50">Tecnología</p>
        <h2 id="tech-title" className="display mt-6 max-w-3xl text-[clamp(2.4rem,5.5vw,4.75rem)]">
          Siete números que explican una raqueta.
        </h2>
      </div>

      <div className="container-rl grid gap-0 pb-24 lg:grid-cols-2 lg:gap-16">
        {/* Sticky 3D stage: top half on mobile, right column on desktop */}
        <div className="sticky top-14 z-20 order-first -mx-5 h-[44svh] md:-mx-10 lg:order-last lg:mx-0 lg:top-[12svh] lg:z-0 lg:h-[76svh]">
          <div className="relative h-full overflow-hidden rounded-b-[2rem] border border-white/10 bg-[radial-gradient(80%_70%_at_50%_40%,#1d1d21,#0b0b0c)] lg:rounded-[2rem]">
            <TechScene active={active} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-4 pt-10">
              <p className="text-[11px] leading-relaxed text-white/70" aria-live="polite">
                {currentChapter.caption}
              </p>
            </div>
            <ol className="absolute right-5 top-5 flex gap-1.5" aria-hidden>
              {chapters.map((c) => (
                <li key={c.id} className={cn("h-1 rounded-full transition-all duration-500", c.id === current ? "w-6 bg-accent" : "w-1.5 bg-white/25")} />
              ))}
            </ol>
          </div>
        </div>

        <div className="relative">
          {chapters.map((c) => (
            <article key={c.id} data-chapter={c.id} className="flex min-h-[70svh] flex-col justify-center py-12 lg:min-h-[85svh]">
              <p data-reveal className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {c.kicker}
              </p>
              <h3 data-reveal className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
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
      <p className="container-rl pb-10 text-[11px] text-white/35">Escena 3D: modelos representativos generados a partir de especificaciones publicadas.</p>
    </section>
  );
}
