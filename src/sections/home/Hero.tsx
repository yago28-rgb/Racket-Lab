"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/motion-kit";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/format";
import type { CourtScene } from "@/components/hero/court-scene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STADIUM = { src: "/media/hero/stadium.webp", depth: "/media/hero/stadium-depth.png", aspect: 1920 / 1280, relief: 3.4 };
const STAND = { src: "/media/hero/crowd-bg.webp", depth: "/media/hero/crowd-depth.png", aspect: 1920 / 1277, relief: 2.6 };
const FOREGROUND = { src: "/media/hero/crowd-fg.webp", top: 763 / 1277, lift: 2.4 };

function Letters({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-hidden className={cn("block overflow-hidden pb-[0.08em]", className)}>
      {[...text].map((ch, i) => (
        <span key={i} data-hero-char className="inline-block will-change-transform">
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/**
 * "The Art of Tennis" — a real-time WebGL camera move through two real
 * photographs of Centre Court (depth-displaced meshes, per-pixel depth of
 * field, drifting sunlit dust). The intro plays on its own (~8 s) but never
 * blocks: scrolling fast-forwards it and then drives the transition into the
 * page. Reduced motion or no WebGL: a still, fully composed frame.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CourtScene | null>(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [late, setLate] = useState(false);

  // If the scene is slow to load, show the copy anyway rather than wait.
  const shownEarly = late && !ready ? true : undefined;
  const [copyShown, setCopyShown] = useState(false);
  if (shownEarly && !copyShown) setCopyShown(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLate(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  // Boot the WebGL scene (code-split: three.js only loads on the home page).
  useEffect(() => {
    if (reduced || !canvas.current) return;
    let cancelled = false;
    let instance: CourtScene | null = null;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    import("@/components/hero/court-scene")
      .then(async ({ CourtScene }) => {
        if (cancelled || !canvas.current) return;
        instance = new CourtScene(canvas.current, { mobile });
        await instance.load([STADIUM, STAND], FOREGROUND);
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

  // Camera choreography + headline, once the scene is on screen.
  useGSAP(
    () => {
      if (reduced || !ready || !scene.current) return;
      const copyAlreadyShown = copyShown;
      const s = scene.current.state;
      const o = scene.current.offset;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      // Phase 1 — establishing: high and wide over Centre Court, out of black.
      Object.assign(s, { x: -0.9, y: 1.5, z: 11.6, tx: -0.2, ty: 0.15, focus: 9.0, aperture: 0.55, mix: 0, exposure: 0.5 });
      const intro = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      intro
        .to(s, { exposure: 1, duration: 1.8, ease: "power1.out" }, 0.2)
        .to(s, { aperture: 0.18, duration: 2.2, ease: "power2.out" }, 0.2)
        // dolly-in towards the court with a slow arc
        .to(s, { x: 0.45, y: 0.35, z: 7.6, tx: 0.25, ty: -0.25, focus: 7.4, duration: 4.4 }, 0)
        // Phase 2 — immersion: the lens racks to the stands as we pass into them
        .to(s, { aperture: 1.2, focus: 2.5, duration: 1.1, ease: "power2.in" }, 3.3)
        .to(s, { mix: 1, duration: 1.0, ease: "power1.inOut" }, 3.9)
        // Phase 3 — behind the spectators: settle in the stand, court ahead
        .fromTo(s, { x: -0.5, y: -0.35, z: 11.6, tx: -0.1, ty: -0.45 }, { x: 0.1, y: -0.75, z: mobile ? 10.6 : 10.1, tx: 0.05, ty: -0.62, duration: 3.6, ease: "power3.out", immediateRender: false }, 4.4)
        .to(s, { focus: 9.2, aperture: 0.42, duration: 2.2, ease: "power2.inOut" }, 4.9);
      // Phase 4 — headline
      if (!copyAlreadyShown) intro
        .fromTo("[data-hero-eyebrow]", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out" }, 6.2)
        .fromTo("[data-hero-char]", { yPercent: 115, rotate: 4, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.3, stagger: 0.035, ease: "expo.out" }, 6.3)
        .fromTo("[data-hero-sub], [data-hero-cta], [data-hero-caption]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: "expo.out" }, 7.1);

      // QA hook: /?hero-seek=<seconds> jumps the intro (software renderers are too slow to watch it).
      const seek = new URLSearchParams(window.location.search).get("hero-seek");
      if (seek) intro.pause(Number(seek));

      // Never hold the visitor hostage: any scroll fast-forwards the intro.
      const skip = () => {
        if (window.scrollY > 4 && intro.isActive()) gsap.to(intro, { progress: 1, duration: 0.9, ease: "power2.out" });
      };
      window.addEventListener("scroll", skip, { passive: true });
      if (window.scrollY > 4) intro.progress(1);

      // Phase 5 → page: the camera pushes over the front rows and the frame
      // folds into a card while the next section rises.
      const out = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.7,
          onUpdate: (st) => {
            if (section.current) section.current.dataset.headerLight = st.progress > 0.62 ? "1" : "";
          },
        },
      });
      out
        .to(o, { z: -2.4, y: 0.35, fgDrop: 1.6, aperture: 0.25, ease: "none", duration: 1 }, 0)
        .to("[data-hero-copy]", { yPercent: -18, opacity: 0, ease: "power1.in", duration: 0.45 }, 0)
        .to("[data-hero-caption]", { opacity: 0, duration: 0.2 }, 0)
        .to("[data-hero-frame]", { clipPath: mobile ? "inset(14% 4% 26% 4% round 22px)" : "inset(12% 5% 20% 5% round 28px)", ease: "power2.inOut", duration: 0.55 }, 0.45)
        .fromTo("[data-hero-next]", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power2.out", duration: 0.3 }, 0.78);

      // Subtle pointer parallax on desktop.
      const onMove = (e: PointerEvent) => {
        if (mobile) return;
        gsap.to(o, { x: (e.clientX / window.innerWidth - 0.5) * 0.35, duration: 1.4, ease: "power3.out", overwrite: "auto" });
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
      className={cn("relative bg-paper", still ? "h-[100svh]" : "h-[230svh]")}
      aria-labelledby="hero-title"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-hero-frame className="absolute inset-0 overflow-hidden bg-night" style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}>
          {/* Composed still: shown until WebGL is ready, and as the reduced-motion frame. */}
          <div className={cn("absolute inset-0 transition-opacity duration-1000", ready && !still ? "opacity-0" : "opacity-100")}>
            <Image
              src={STADIUM.src}
              alt="Centre Court lleno durante un partido sobre hierba, visto desde la grada"
              fill
              priority
              sizes="100vw"
              className={cn("object-cover", still ? "" : "brightness-[0.55]")}
            />
          </div>
          {!still && <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />}
          {/* Editorial grade for legibility: deep green from the lower left. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(13,34,25,0.78)_0%,rgba(13,34,25,0.25)_14%,rgba(13,34,25,0)_30%),radial-gradient(110%_90%_at_12%_82%,rgba(13,34,25,0.88)_0%,rgba(13,34,25,0.5)_42%,rgba(13,34,25,0)_78%)]" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.45)]" />
        </div>

        <div data-hero-copy className="container-rl relative z-10 flex h-full flex-col justify-end pb-[12svh] text-cream [text-shadow:0_2px_28px_rgba(5,15,10,0.55)] md:pb-[13svh]">
          <p data-hero-eyebrow className="eyebrow !text-[#e6d3a4]">
            Racket Lab · The Grass Court Edition
          </p>
          <h1 id="hero-title" aria-label="The Art of Tennis." className="display mt-5 text-[clamp(3.4rem,10vw,9.5rem)] !leading-[0.88]">
            <Letters text="The Art" />
            <Letters text="of Tennis." className="italic text-cream/90" />
          </h1>
          <p data-hero-sub className="mt-7 max-w-md text-[17px] leading-relaxed text-cream/80 md:text-lg">
            Raquetas elegidas con el rigor de un torneo: especificaciones verificadas y una recomendación hecha a tu medida.
          </p>
          <div data-hero-cta className="mt-9 flex flex-wrap gap-3">
            <Magnetic>
              <ButtonLink href="/raquetas" size="lg" variant="inverted">
                Explorar raquetas
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="/racket-finder" size="lg" variant="outline-inverted">
                Encuentra la tuya
              </ButtonLink>
            </Magnetic>
          </div>
        </div>

        <p data-hero-caption className="absolute bottom-6 right-5 z-10 hidden max-w-[17rem] text-right text-[11px] leading-snug text-cream/55 md:block">
          Centre Court, All England Club. Fotografías: danielcooper850 (CC BY-SA 4.0) y Marc Di Luzio (CC BY 2.0), vía Wikimedia Commons.
        </p>

        {!still && (
          <div data-hero-next className="pointer-events-none absolute inset-x-0 bottom-[5%] z-10 opacity-0">
            <p className="container-rl text-center font-serif text-[clamp(1.4rem,2.6vw,2.2rem)] italic text-club">
              Cada punto empieza mucho antes del saque.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
