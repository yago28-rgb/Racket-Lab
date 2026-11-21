"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Editorial spread. The ivy façade is pinned while the headline slides over
 * it; then the match photograph opens from a narrow slit, its own camera
 * pushing in.
 */
export function GrassCourt() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo("[data-ivy]", { scale: 1.18, yPercent: -4 }, { scale: 1, yPercent: 4, ease: "none", scrollTrigger: { trigger: "[data-ivy-wrap]", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(
        "[data-ivy-line]",
        { yPercent: 120 },
        { yPercent: 0, stagger: 0.12, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-ivy-wrap]", start: "top 55%" } },
      );
      gsap.fromTo(
        "[data-gc-photo]",
        { clipPath: "inset(30% 44% 30% 44%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: "[data-gc-photo]", start: "top 90%", end: "top 30%", scrub: 0.8 } },
      );
      gsap.fromTo("[data-gc-img]", { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-gc-photo]", start: "top bottom", end: "bottom 40%", scrub: true } });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section ref={root} className="bg-night text-cream" aria-labelledby="gc-title">
      <div data-ivy-wrap className="relative h-[92svh] overflow-hidden md:h-[110svh]">
        <Image
          data-ivy
          src="/media/photos/centre-court-ivy.webp"
          alt="Fachada del Centre Court cubierta de hiedra"
          fill
          quality={90}
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(13,34,25,0.92)_0%,rgba(13,34,25,0.4)_40%,rgba(13,34,25,0.05)_70%)]" />
        <h2 id="gc-title" className="absolute inset-x-0 bottom-0 px-5 pb-[10svh] font-serif text-[clamp(3rem,9vw,9.5rem)] font-medium leading-[0.88] tracking-[-0.03em] md:px-[6vw]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ivy-line className="block">
              Sobre hierba,
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ivy-line className="block italic text-gold">
              el tiempo no espera.
            </span>
          </span>
        </h2>
        <p className="absolute right-5 top-24 max-w-[14rem] text-right text-[11px] text-cream/55 md:right-[6vw]">
          Centre Court, fachada de hiedra. Foto: Gabinho, CC BY-SA 4.0, vía Wikimedia Commons.
        </p>
      </div>

      <div className="grid gap-14 px-5 py-24 md:grid-cols-12 md:gap-8 md:px-[6vw] md:py-36">
        <div className="md:col-span-4 md:pt-6">
          <p className="text-[19px] leading-relaxed text-cream/85">
            La hierba es la superficie más rápida del circuito. La bola bota bajo y patina, y premia el saque, la volea y el golpe
            cortado.
          </p>
          <p className="mt-6 text-[17px] leading-relaxed text-cream/60">
            Ahí se nota un balance hacia el puño para reaccionar en la red, algo más de masa para sostener el resto y un patrón
            más cerrado para controlar bolas que llegan bajas. Es orientación general: el Racket Finder lo pondera con tu nivel y tu
            forma de jugar.
          </p>
          <Link href="/racket-finder" className="group mt-10 inline-flex items-center gap-0.5 text-[17px] font-medium text-cream hover:text-gold">
            Encontrar la mía <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <figure className="md:col-span-7 md:col-start-6">
          <div data-gc-photo className="relative aspect-[4/3] overflow-hidden">
            <Image
              data-gc-img
              src="/media/photos/centre-court-match.webp"
              alt="Partido sobre la hierba del Centre Court con las gradas llenas"
              fill
              quality={90}
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 text-[11px] text-cream/50">Centre Court, 2026. Foto: Daniel Cooper, CC BY-SA 4.0, vía Wikimedia Commons.</figcaption>
        </figure>
      </div>
    </section>
  );
}
