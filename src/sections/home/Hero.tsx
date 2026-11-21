"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/format";
import type { CourtScene, PlateSpec } from "@/components/hero/court-scene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PLATE = {
  depth: "/media/hero/centre-court-depth.png",
  mask: "/media/hero/centre-court-mask.png",
  relief: 3.2,
};

function Letters({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-hidden className={cn("block overflow-hidden pb-[0.1em]", className)}>
      {[...text].map((ch, i) => (
        <span key={i} data-hero-char className="inline-block will-change-transform">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/**
 * "The Art of Tennis" — a real-time WebGL camera move over a 3840 px
 * photograph of Centre Court (depth-displaced mesh, drifting cloud shadows,
 * per-pixel depth of field while travelling). The intro plays on its own
 * (~7 s) but never blocks: scrolling fast-forwards it and then drives the
 * transition into the page. Reduced motion or no WebGL: a still frame.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CourtScene | null>(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [late, setLate] = useState(false);
  const [copyShown, setCopyShown] = useState(false);
  if (late && !ready && !copyShown) setCopyShown(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLate(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (reduced || !canvas.current) return;
    let cancelled = false;
    let instance: CourtScene | null = null;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const big = !mobile && window.innerWidth * Math.min(window.devicePixelRatio, 2) > 2000;
    const spec: PlateSpec = big
      ? { ...PLATE, src: "/media/hero/centre-court-3840.webp", width: 3840, height: 2560 }
      : { ...PLATE, src: "/media/hero/centre-court-1920.webp", width: 1920, height: 1280 };
    import("@/components/hero/court-scene")
      .then(async ({ CourtScene }) => {
        if (cancelled || !canvas.current) return;
        instance = new CourtScene(canvas.current, { mobile });
        await instance.load(spec);
        if (cancelled) return instance.dispose();
        scene.current = instance;
        instance.start();
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));

    const onResize = () => scene.current?.resize();
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.current?.start() : scene.current?.stop()));
    if (section.current) io.observe(section.current);
    const onVis = () => (document.hidden ? scene.current?.stop() : scene.current?.start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      instance?.dispose();
      scene.current = null;
    };
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced || !ready || !scene.current) return;
      const s = scene.current.state;
      const o = scene.current.offset;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      // Crane shot: from high over the roof line down towards the court,
      // racking focus from the far stands to the players, ending pin sharp.
      Object.assign(s, { x: -0.7, y: 0.75, z: 10.7, tx: -0.2, ty: 0.55, focus: 12.5, aperture: 0.5, exposure: 0.35 });
      const intro = gsap.timeline();
      intro
        .to(s, { exposure: 1, duration: 2.2, ease: "power2.out" }, 0)
        .to(s, { x: 0.35, y: -0.15, z: 9.4, tx: 0.15, ty: -0.35, duration: 6.4, ease: "power3.inOut" }, 0)
        .to(s, { focus: 9.6, duration: 3.2, ease: "power2.inOut" }, 0.6)
        .to(s, { aperture: 0, duration: 2.4, ease: "power2.inOut" }, 4.2);
      if (!copyShown) {
        intro
          .fromTo("[data-hero-char]", { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.04, ease: "expo.out" }, 3.0)
          .fromTo("[data-hero-sub], [data-hero-cta], [data-hero-caption]", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: "expo.out" }, 4.0);
      }

      // QA hook: /?hero-seek=<seconds> (software renderers are too slow to watch it).
      const seek = new URLSearchParams(window.location.search).get("hero-seek");
      if (seek) intro.pause(Number(seek));

      // Never hold the visitor: any scroll fast-forwards the intro.
      const skip = () => {
        if (window.scrollY > 4 && intro.isActive()) gsap.to(intro, { progress: 1, duration: 0.9, ease: "power2.out" });
      };
      window.addEventListener("scroll", skip, { passive: true });
      if (window.scrollY > 4) intro.progress(1);

      // Scroll: the camera keeps flying towards the baseline while the
      // frame folds into a card and the next section takes over.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            onUpdate: (st) => {
              if (section.current) section.current.dataset.headerLight = st.progress > 0.6 ? "1" : "";
            },
          },
        })
        .to(o, { z: -3.2, y: -0.55, ty: -0.6, ease: "none", duration: 1 }, 0)
        .to("[data-hero-copy]", { yPercent: -14, opacity: 0, ease: "power1.in", duration: 0.42 }, 0)
        .to("[data-hero-caption]", { opacity: 0, duration: 0.2 }, 0)
        .to(
          "[data-hero-frame]",
          { clipPath: mobile ? "inset(16% 5% 24% 5% round 20px)" : "inset(11% 6% 17% 6% round 26px)", ease: "power2.inOut", duration: 0.55 },
          0.45,
        )
        .fromTo("[data-hero-next]", { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: "power2.out", duration: 0.3 }, 0.78);

      const onMove = (e: PointerEvent) => {
        if (mobile) return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        gsap.to(o, { x: nx * 0.7, tx: nx * 0.2, y: -ny * 0.3, duration: 1.8, ease: "power3.out", overwrite: "auto" });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => {
        window.removeEventListener("scroll", skip);
        window.removeEventListener("pointermove", onMove);
      };
    },
    { scope: section, dependencies: [reduced, ready, copyShown] },
  );

  const still = reduced || failed;

  return (
    <section
      ref={section}
      data-dark-hero
      data-intro={still || copyShown ? undefined : ready ? "playing" : "pending"}
      className={cn("relative bg-paper", still ? "h-[100svh]" : "h-[220svh]")}
      aria-labelledby="hero-title"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-hero-frame className="absolute inset-0 overflow-hidden bg-night" style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}>
          <div className={cn("absolute inset-0 transition-opacity duration-1000", ready && !still ? "opacity-0" : "opacity-100")}>
            <Image
              src="/media/hero/centre-court-1920.webp"
              alt="Centre Court lleno durante un partido sobre hierba, visto desde la grada"
              fill
              priority
              quality={90}
              sizes="100vw"
              className={cn("object-cover", still ? "" : "brightness-[0.4]")}
            />
          </div>
          {!still && <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />}
          {/* Only where the type sits: a low, soft wash of club green. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(13,34,25,0.55)_0%,rgba(13,34,25,0)_16%),linear-gradient(0deg,rgba(13,34,25,0.85)_0%,rgba(13,34,25,0.35)_32%,rgba(13,34,25,0)_55%)]" />
        </div>

        <div data-hero-copy className="relative z-10 flex h-full flex-col justify-end px-5 pb-[9svh] text-cream md:px-[6vw] md:pb-[10svh]">
          <h1 id="hero-title" aria-label="The Art of Tennis." className="font-serif text-[clamp(3.6rem,11.5vw,12rem)] font-medium leading-[0.84] tracking-[-0.025em]">
            <Letters text="The Art" />
            <Letters text="of Tennis." className="italic md:pl-[0.9em]" />
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
            <p data-hero-sub className="max-w-sm text-[17px] leading-relaxed text-cream/85">
              Raquetas elegidas con el rigor de un torneo. Especificaciones verificadas y una recomendación hecha a tu medida.
            </p>
            <div data-hero-cta className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[17px]">
              <Link href="/raquetas" className="group inline-flex items-center gap-1 font-medium text-cream hover:text-gold">
                Ver raquetas <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link href="/racket-finder" className="group inline-flex items-center gap-1 text-cream/80 hover:text-gold">
                Encontrar la mía <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        <p data-hero-caption className="absolute right-[6vw] top-24 z-10 hidden max-w-[15rem] text-right text-[11px] leading-snug text-cream/60 md:block">
          Centre Court, 2026. Foto: danielcooper850, CC BY-SA 4.0, vía Wikimedia Commons.
        </p>

        {!still && (
          <div data-hero-next className="pointer-events-none absolute inset-x-0 bottom-[6%] z-10 opacity-0">
            <p className="text-center font-serif text-[clamp(1.5rem,2.8vw,2.4rem)] italic text-club">Cada punto empieza mucho antes del saque.</p>
          </div>
        )}
      </div>
    </section>
  );
}
