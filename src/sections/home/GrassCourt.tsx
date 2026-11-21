"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const points = [
  ["Manejabilidad", "Un balance hacia el puño y un swingweight contenido ayudan a reaccionar a tiempo en la red."],
  ["Estabilidad", "Algo más de peso estático sostiene los golpes planos y los restos a saques rápidos."],
  ["Control", "Un patrón de cuerdas más cerrado y una cabeza de 95–98 in² favorecen la precisión con bolas bajas."],
] as const;

/**
 * Editorial spread on grass-court play. The photograph opens from a narrow
 * slit to full width as it scrolls in (clip-path, scrubbed) while the copy
 * column settles on the cream page.
 */
export function GrassCourt() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-gc-photo]",
        { clipPath: "inset(18% 38% 18% 38% round 2px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 28px)",
          ease: "none",
          scrollTrigger: { trigger: "[data-gc-photo]", start: "top 85%", end: "center 55%", scrub: 0.8 },
        },
      );
      gsap.fromTo(
        "[data-gc-img]",
        { scale: 1.3 },
        { scale: 1.02, ease: "none", scrollTrigger: { trigger: "[data-gc-photo]", start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.from("[data-gc-point]", {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-gc-points]", start: "top 80%" },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="overflow-hidden bg-mist py-28 md:py-40" aria-labelledby="gc-title">
      <div className="container-rl grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5 lg:pt-10">
          <p className="eyebrow">Sobre hierba</p>
          <h2 id="gc-title" className="display mt-6 text-[clamp(2.6rem,5.4vw,4.9rem)] text-club">
            Donde el tiempo se mide <em className="text-accent-ink">en milésimas.</em>
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/70">
            La hierba es la superficie más rápida del circuito: la bola bota bajo y patina. Premia el saque, la volea y el golpe
            cortado, y no perdona una preparación tardía.
          </p>
          <Link
            href="/racket-finder"
            className="group mt-10 inline-flex items-center gap-3 border-b border-club/30 pb-1.5 text-[15px] font-medium text-club transition-colors hover:border-gold"
          >
            Encuentra la raqueta para tu juego
            <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>

        <figure className="lg:col-span-7">
          <div data-gc-photo className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-night">
            <Image
              data-gc-img
              src="/media/photos/centre-court-match.webp"
              alt="Partido sobre la hierba del Centre Court con las gradas llenas"
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 text-right text-[11px] text-muted">Centre Court, 2026. Foto: Daniel Cooper, CC BY-SA 4.0, vía Wikimedia Commons.</figcaption>
        </figure>
      </div>

      <ol data-gc-points className="container-rl mt-20 grid gap-10 border-t border-line pt-12 md:grid-cols-3 md:gap-12">
        {points.map(([title, text], i) => (
          <li key={title} data-gc-point>
            <span className="font-serif text-4xl italic text-gold">0{i + 1}</span>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-club">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{text}</p>
          </li>
        ))}
      </ol>
      <p className="container-rl mt-8 text-xs text-muted">Orientación general. El Racket Finder pondera estos factores según tu nivel y tu forma de jugar.</p>
    </section>
  );
}
