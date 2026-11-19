"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ButtonLink } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="h-px w-24 animate-pulse bg-ink/20" />
    </div>
  ),
});

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from("[data-hero-eyebrow]", { y: 14, opacity: 0, duration: 1 }, 0.1)
        .from("[data-hero-line]", { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.2)
        .from("[data-hero-sub]", { y: 14, opacity: 0, duration: 1 }, 0.6)
        .from("[data-hero-cta]", { y: 14, opacity: 0, duration: 1 }, 0.75)
        .from("[data-hero-canvas]", { opacity: 0, scale: 0.94, duration: 2 }, 0.2);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });
      tl.to("[data-hero-a]", { yPercent: -18, opacity: 0, ease: "none", duration: 0.3 }, 0.05)
        .to("[data-hero-scroll]", { opacity: 0, duration: 0.1 }, 0)
        .fromTo("[data-hero-b]", { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.2 }, 0.42)
        .fromTo("[data-hero-spec]", { opacity: 0, x: -12 }, { opacity: 1, x: 0, stagger: 0.06, duration: 0.15 }, 0.5)
        .to({}, { duration: 0.2 }, 0.8);
    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section ref={section} className={cn("relative", reduced ? "h-[100svh]" : "h-[260svh]")} aria-labelledby="hero-title">
      <div className="studio-bg sticky top-0 h-[100svh] overflow-hidden">
        <div data-hero-canvas className="absolute inset-x-0 bottom-0 top-[55%] md:inset-y-0 md:left-[40%] md:right-0 md:top-0">
          <HeroScene progress={progress} />
        </div>

        {/* Phase A — headline */}
        <div data-hero-a className="container-rl relative z-10 flex h-full flex-col justify-start pt-[13svh] md:justify-center md:pt-0">
          <p data-hero-eyebrow className="eyebrow">
            Premium tennis equipment · España & Europa
          </p>
          <h1 id="hero-title" className="display mt-5 text-[clamp(3.1rem,8.6vw,8.2rem)]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block">
                YOUR GAME.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block text-ink/35">
                YOUR RACKET.
              </span>
            </span>
          </h1>
          <p data-hero-sub className="mt-6 max-w-sm text-lg text-ink/70 md:text-xl">
            Find the racket that plays like you.
          </p>
          <div data-hero-cta className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/raquetas" size="lg">
              Explore rackets
            </ButtonLink>
            <ButtonLink href="/racket-finder" size="lg" variant="secondary">
              Find your racket
            </ButtonLink>
          </div>
        </div>

        {/* Phase B — appears while the camera dives into the string bed */}
        {!reduced && (
          <div data-hero-b className="pointer-events-none absolute inset-x-0 top-0 z-10 opacity-0">
            <div className="container-rl pt-[12svh] md:pt-[22svh]">
              <p className="eyebrow">Engineered for your game</p>
              <h2 className="display mt-5 max-w-md text-[clamp(2.2rem,5vw,4.4rem)]">Every detail, measured.</h2>
              <ul className="mt-6 space-y-2.5 text-sm text-ink/70 md:mt-8 md:space-y-3">
                {["Cordaje 16×19 entrelazado", "Lacado con clearcoat sobre carbono", "Grip de piel con overgrip en espiral"].map((t) => (
                  <li key={t} data-hero-spec className="flex items-center gap-3">
                    <span className="h-px w-6 bg-ink/40" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-muted md:mt-8">Render 3D · modelo RACKET LAB Studio</p>
            </div>
          </div>
        )}

        <a
          href="#filosofia"
          data-hero-scroll
          className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted md:flex"
        >
          Scroll
          <span className="flex h-9 w-5 justify-center rounded-full border border-ink/20 pt-1.5">
            <span className="h-1.5 w-1 animate-bounce rounded-full bg-ink/60" />
          </span>
        </a>
      </div>
    </section>
  );
}
