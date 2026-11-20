"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/motion-kit";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/format";
import { videos } from "@/lib/media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface HeroRacket {
  slug: string;
  src: string;
  brand: string;
  model: string;
}

/**
 * Real footage full-bleed. On scroll (GSAP ScrollTrigger, scrubbed) the video
 * frame contracts into a rounded card while the line-up of real racket photos
 * rises in. Reduced motion: a single static screen.
 */
export function Hero({ rackets }: { rackets: HeroRacket[] }) {
  const section = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-hero-eyebrow]", { y: 14, opacity: 0, duration: 1 }, 0.15)
        .from("[data-hero-line]", { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.25)
        .from("[data-hero-sub], [data-hero-cta]", { y: 14, opacity: 0, duration: 1, stagger: 0.1 }, 0.65);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.to("[data-hero-frame]", { clipPath: "inset(9% 6% 31% 6% round 28px)", ease: "none", duration: 0.5 }, 0)
        .to("[data-hero-video]", { scale: 1.12, ease: "none", duration: 0.5 }, 0)
        .to("[data-hero-copy]", { yPercent: -30, opacity: 0, ease: "none", duration: 0.3 }, 0.02)
        .to("[data-hero-scroll]", { opacity: 0, duration: 0.08 }, 0)
        .fromTo("[data-hero-lineup]", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power2.out", duration: 0.35 }, 0.3)
        .fromTo("[data-hero-card]", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, ease: "power2.out", duration: 0.25 }, 0.4)
        .to({}, { duration: 0.15 }, 0.85);
    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section ref={section} className={cn("relative bg-white", reduced ? "h-[100svh]" : "h-[230svh]")} aria-labelledby="hero-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Real footage, framed by an animated clip-path */}
        <div data-hero-frame className="absolute inset-0 overflow-hidden bg-night" style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}>
          <div data-hero-video className="absolute inset-0">
            <BackgroundVideo base={videos.playerBacklit.base} label={videos.playerBacklit.label} priority />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
        </div>

        <div data-hero-copy className="container-rl relative z-10 flex h-full flex-col justify-end pb-[14svh] text-white md:pb-[16svh]">
          <p data-hero-eyebrow className="eyebrow !text-white/70">
            Premium tennis equipment · España & Europa
          </p>
          <h1 id="hero-title" className="display mt-5 text-[clamp(3.1rem,8.6vw,8.2rem)]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block">
                YOUR GAME.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block text-white/55">
                YOUR RACKET.
              </span>
            </span>
          </h1>
          <p data-hero-sub className="mt-6 max-w-sm text-lg text-white/80 md:text-xl">
            Find the racket that plays like you.
          </p>
          <div data-hero-cta className="mt-9 flex flex-wrap gap-3">
            <Magnetic>
              <ButtonLink href="/raquetas" size="lg" variant="inverted">
                Explore rackets
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="/racket-finder" size="lg" variant="outline-inverted">
                Find your racket
              </ButtonLink>
            </Magnetic>
          </div>
        </div>

        {/* Line-up: real product photos rise in as the frame contracts */}
        {!reduced && (
          <div data-hero-lineup className="absolute inset-x-0 bottom-0 z-10 h-[31%] opacity-0">
            <div className="container-rl flex h-full items-center gap-4 md:gap-6">
              <div className="hidden max-w-[16rem] shrink-0 md:block">
                <p className="eyebrow">The line-up</p>
                <p className="mt-3 text-2xl font-semibold leading-tight tracking-tight">Raquetas reales. Datos verificados.</p>
                <Link href="/raquetas" className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
                  Ver catálogo →
                </Link>
              </div>
              {rackets.length > 0 ? (
                <ul className="flex h-[88%] flex-1 gap-3 md:gap-4">
                  {rackets.map((r) => (
                    <li key={r.slug} data-hero-card className="relative flex-1 overflow-hidden rounded-2xl bg-mist">
                      <Link href={`/raquetas/${r.slug}`} className="absolute inset-0" aria-label={`${r.brand} ${r.model}`}>
                        <Image src={r.src} alt={`${r.brand} ${r.model}`} fill sizes="(min-width: 768px) 22vw, 33vw" className="object-contain p-3 mix-blend-multiply" />
                        <span className="absolute bottom-2 left-3 text-[11px] font-medium text-ink/70">{r.model}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div data-hero-card className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line text-sm text-muted">
                  Añade las fotos de las raquetas en public/fotos (ver FOTOS.md) para verlas aquí.
                </div>
              )}
            </div>
          </div>
        )}

        <a
          href="#filosofia"
          data-hero-scroll
          className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70 md:flex"
        >
          Scroll
          <span className="flex h-9 w-5 justify-center rounded-full border border-white/30 pt-1.5">
            <span className="h-1.5 w-1 animate-bounce rounded-full bg-white/80" />
          </span>
        </a>
      </div>
    </section>
  );
}
