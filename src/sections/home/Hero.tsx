"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronRight } from "lucide-react";
import { Magnetic } from "@/components/ui/motion-kit";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/format";
import { videos } from "@/lib/media";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const scenes = [videos.heroAerial, videos.heroForehand, videos.heroStadium];
const labels = ["El saque", "El golpe", "La pista"];

function Split({ text, attr, className }: { text: string; attr: string; className?: string }) {
  return (
    <span aria-hidden className={cn("block overflow-hidden pb-[0.06em]", className)}>
      {[...text].map((ch, i) => (
        <span key={i} {...{ [attr]: "" }} className="inline-block will-change-transform">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/**
 * Scroll-told opening in three real shots (Mixkit, graded to the brand
 * palette): a top-down serve, a backlit forehand and a stadium serve.
 * Each change of scene is a different cut — an iris that opens from the
 * centre, then a horizontal wipe — while the outgoing shot keeps pushing in.
 * The frame finally folds into a card and hands over to the page.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  // Only the visible shot decodes; the next one is warmed up in advance.
  const play = (i: number) => {
    vids.current.forEach((v, j) => {
      if (!v) return;
      if (j === i) {
        if (v.preload !== "auto") v.preload = "auto";
        v.play().catch(() => {});
      } else if (j === i + 1) {
        if (v.preload !== "auto") v.preload = "auto";
        v.pause();
      } else v.pause();
    });
  };

  useEffect(() => {
    if (reduced) {
      vids.current.forEach((v) => v?.pause());
      return;
    }
    play(0);
    const onVis = () => (document.hidden ? vids.current.forEach((v) => v?.pause()) : play(Number(section.current?.dataset.scene ?? 0)));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced) return;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      // Opening: the title assembles letter by letter over the first shot.
      gsap
        .timeline({ delay: 0.15 })
        .fromTo("[data-h1c]", { yPercent: 120, rotate: 6 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.03, ease: "expo.out" })
        .fromTo("[data-s1-sub]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "expo.out" }, 0.7)
        .fromTo("[data-hero-rail]", { opacity: 0 }, { opacity: 1, duration: 1 }, 1);

      // Slow continuous camera drift on every shot.
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el, i) => {
        gsap.fromTo(el, { scale: 1.04, xPercent: i % 2 ? 1.2 : -1.2 }, { scale: 1.12, xPercent: i % 2 ? -1.2 : 1.2, duration: 16, ease: "sine.inOut", repeat: -1, yoyo: true });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          onUpdate: (st) => {
            const p = st.progress;
            const scene = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;
            const el = section.current;
            if (el && el.dataset.scene !== String(scene)) {
              el.dataset.scene = String(scene);
              play(scene);
            }
            if (el) el.dataset.headerLight = p > 0.9 ? "1" : "";
          },
        },
      });

      tl
        // Scene 1 → 2: push in, copy lifts away, iris opens on the forehand.
        .to("[data-shot='0']", { scale: 1.25, duration: 0.3 }, 0)
        .to("[data-s1]", { yPercent: -35, opacity: 0, duration: 0.16 }, 0.06)
        .fromTo("[data-layer='1']", { clipPath: "circle(0% at 50% 55%)" }, { clipPath: "circle(75% at 50% 55%)", duration: 0.16, ease: "power2.inOut" }, 0.14)
        .fromTo("[data-shot='1']", { scale: 1.3 }, { scale: 1, duration: 0.22, ease: "power2.out" }, 0.14)
        .fromTo("[data-s2]", { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.21)
        .fromTo("[data-s2c]", { yPercent: 110 }, { yPercent: 0, stagger: 0.012, duration: 0.1, ease: "power3.out" }, 0.22)
        .fromTo("[data-s2-sub]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.06 }, 0.3)
        // Scene 2 → 3: parallax slide and a hard horizontal wipe to the stadium.
        .to("[data-shot='1']", { xPercent: -8, duration: 0.25 }, 0.42)
        .to("[data-s2]", { xPercent: -12, opacity: 0, duration: 0.12 }, 0.46)
        .fromTo("[data-layer='2']", { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.14, ease: "power3.inOut" }, 0.48)
        .fromTo("[data-shot='2']", { xPercent: 10, scale: 1.15 }, { xPercent: 0, scale: 1, duration: 0.2, ease: "power2.out" }, 0.48)
        .fromTo("[data-s3]", { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.57)
        .fromTo("[data-s3c]", { yPercent: 110 }, { yPercent: 0, stagger: 0.01, duration: 0.1, ease: "power3.out" }, 0.58)
        .fromTo("[data-s3-sub]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.06 }, 0.64)
        // Hand-over: the frame folds into a card on the paper.
        .to("[data-s3]", { opacity: 0, y: -40, duration: 0.1 }, 0.8)
        .to("[data-hero-rail]", { opacity: 0, duration: 0.05 }, 0.8)
        .to("[data-frame]", { clipPath: mobile ? "inset(14% 4% 22% 4% round 22px)" : "inset(10% 5% 16% 5% round 28px)", duration: 0.16, ease: "power2.inOut" }, 0.82)
        .fromTo("[data-hero-next]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.08 }, 0.9)
        // Progress rail.
        .fromTo("[data-rail-fill]", { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 0);

      // Pointer parallax on the type layer (desktop).
      const onMove = (e: PointerEvent) => {
        if (mobile) return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        gsap.to("[data-type-layer]", { x: nx * -18, y: ny * -10, duration: 1.2, ease: "power3.out", overwrite: "auto" });
        gsap.to("[data-video-layer]", { x: nx * 14, y: ny * 8, duration: 1.6, ease: "power3.out", overwrite: "auto" });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: section, dependencies: [reduced] },
  );

  return (
    <section
      ref={section}
      data-dark-hero
      data-scene="0"
      className={cn("relative bg-paper", reduced ? "h-[100svh]" : "h-[420svh]")}
      aria-labelledby="hero-title"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-frame className="absolute inset-0 overflow-hidden bg-night" style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}>
          <div data-video-layer className="absolute -inset-6">
            {scenes.map((v, i) => (
              <div key={v.base} data-layer={i} className="absolute inset-0 overflow-hidden" style={i ? { clipPath: i === 1 ? "circle(0% at 50% 55%)" : "inset(0% 0% 0% 100%)" } : undefined}>
                <div data-shot={i} className="absolute inset-0">
                  <div data-drift className="absolute inset-0">
                    <video
                      ref={(el) => {
                        vids.current[i] = el;
                      }}
                      className="h-full w-full object-cover"
                      poster={`${v.base}-poster.webp`}
                      muted
                      loop
                      playsInline
                      preload={i === 0 ? "auto" : "none"}
                      aria-label={v.label}
                      disablePictureInPicture
                    >
                      <source src={`${v.base}.mp4`} type="video/mp4" />
                      <source src={`${v.base}.webm`} type="video/webm" />
                    </video>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,17,0.55)_0%,rgba(18,18,17,0)_18%,rgba(18,18,17,0)_45%,rgba(18,18,17,0.8)_100%)]" />
        </div>

        <div data-type-layer className="pointer-events-none absolute inset-0 z-10 text-paper">
          {/* Scene 1 */}
          <div data-s1 className="pointer-events-auto absolute inset-x-0 bottom-0 px-5 pb-[10svh] md:px-[5vw] md:pb-[9svh]">
            <h1 id="hero-title" aria-label="Raquetas de tenis." className="text-[clamp(3.6rem,13vw,13.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
              <Split text="Raquetas" attr="data-h1c" />
              <span className="flex items-baseline gap-[0.18em]">
                <Split text="de" attr="data-h1c" />
                <Split text="tenis." attr="data-h1c" className="font-serif font-normal italic tracking-[-0.02em]" />
              </span>
            </h1>
            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <p data-s1-sub className="max-w-md text-[clamp(1.05rem,1.4vw,1.3rem)] leading-snug text-paper/80">
                Veintiún modelos de siete marcas, con cada especificación verificada. Y una recomendación hecha a tu medida.
              </p>
              <div data-s1-sub className="flex items-center gap-5">
                <Magnetic>
                  <Link href="/raquetas" className="inline-flex h-12 items-center rounded-full bg-paper px-7 text-[16px] text-ink transition-colors hover:bg-white">
                    Ver raquetas
                  </Link>
                </Magnetic>
                <Link href="/racket-finder" className="group inline-flex items-center gap-0.5 text-[16px] text-paper hover:underline">
                  Encontrar la mía <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {!reduced && (
            <>
          {/* Scene 2 */}
          <div data-s2 className="absolute inset-y-0 left-0 flex opacity-0 max-w-[62rem] flex-col justify-center px-5 md:px-[5vw]">
            <p className="text-[clamp(3rem,9vw,9rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
              <Split text="Cada golpe" attr="data-s2c" />
              <Split text="empieza aquí." attr="data-s2c" className="font-serif font-normal italic tracking-[-0.02em] text-silver" />
            </p>
            <p data-s2-sub className="mt-6 opacity-0 max-w-sm text-[17px] leading-snug text-paper/75">
              Diez gramos o tres puntos de balance cambian cómo sale la bola. Por eso medimos lo que importa.
            </p>
          </div>

          {/* Scene 3 */}
          <div data-s3 className="pointer-events-auto absolute inset-y-0 right-0 flex opacity-0 max-w-[60rem] flex-col items-end justify-center px-5 text-right md:px-[5vw]">
            <p className="text-[clamp(3rem,9vw,9rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
              <Split text="Hecha para" attr="data-s3c" />
              <Split text="la pista central." attr="data-s3c" className="font-serif font-normal italic tracking-[-0.02em]" />
            </p>
            <div data-s3-sub className="mt-7 opacity-0">
              <Link href="#seleccion" className="group inline-flex items-center gap-0.5 text-[17px] text-paper hover:underline">
                Ver la selección <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Scene rail */}
        {!reduced && (
          <div data-hero-rail className="absolute left-5 right-5 top-20 z-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-paper/60 md:left-[5vw] md:right-[5vw]">
            <span className="hidden gap-6 md:flex">
              {labels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
            <span className="relative h-px flex-1 bg-paper/20">
              <span data-rail-fill className="absolute inset-0 origin-left bg-paper/80" />
            </span>
            <span className="normal-case tracking-normal">Vídeo: Mixkit</span>
          </div>
        )}

        {!reduced && (
          <p data-hero-next className="pointer-events-none absolute inset-x-0 bottom-[5%] z-10 text-center text-[clamp(1.4rem,2.6vw,2.4rem)] font-semibold tracking-[-0.03em] text-ink opacity-0">
            Cada punto empieza <span className="font-serif font-normal italic">mucho antes del saque.</span>
          </p>
        )}
      </div>
    </section>
  );
}
