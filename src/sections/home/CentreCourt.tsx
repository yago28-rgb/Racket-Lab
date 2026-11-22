"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import type { CourtScene, PlateSpec } from "@/components/hero/court-scene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Editorial interlude: a real-time WebGL camera move over a 3840 px
 * photograph of Centre Court (depth-displaced mesh, drifting cloud shadows,
 * depth of field while the camera travels). Scroll drives the crane shot;
 * the scene only loads when it is about to enter the viewport.
 */
export function CentreCourt() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<CourtScene | null>(null);
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced || !canvas.current || !section.current) return;
    let instance: CourtScene | null = null;
    let cancelled = false;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const big = !mobile && window.innerWidth * Math.min(window.devicePixelRatio, 2) > 2000;
    const spec: PlateSpec = {
      depth: "/media/hero/centre-court-depth.png",
      mask: "/media/hero/centre-court-mask.png",
      relief: 3.2,
      ...(big ? { src: "/media/hero/centre-court-3840.webp", width: 3840, height: 2560 } : { src: "/media/hero/centre-court-1920.webp", width: 1920, height: 1280 }),
    };
    const boot = () =>
      import("@/components/hero/court-scene").then(async ({ CourtScene }) => {
        if (cancelled || !canvas.current) return;
        instance = new CourtScene(canvas.current, { mobile });
        await instance.load(spec);
        if (cancelled) return instance.dispose();
        Object.assign(instance.state, { x: -0.6, y: 0.7, z: 10.7, tx: -0.2, ty: 0.5, focus: 12, aperture: 0.4, exposure: 1 });
        scene.current = instance;
        instance.start();
        setReady(true);
      });
    let booted = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !booted) {
          booted = true;
          boot().catch(() => {});
        }
        if (e.isIntersecting) scene.current?.start();
        else scene.current?.stop();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(section.current);
    const onResize = () => scene.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener("resize", onResize);
      instance?.dispose();
      scene.current = null;
    };
  }, [reduced]);

  useGSAP(
    () => {
      if (reduced || !ready || !scene.current) return;
      const s = scene.current.state;
      gsap
        .timeline({ scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom bottom", scrub: 1 } })
        .to(s, { x: 0.35, y: -0.15, z: 9.3, tx: 0.15, ty: -0.35, ease: "power1.inOut", duration: 1 }, 0)
        .to(s, { focus: 9.5, duration: 0.6 }, 0.1)
        .to(s, { aperture: 0, duration: 0.3 }, 0.6)
        .to(s, { z: 7.4, ty: -0.6, y: -0.5, duration: 0.5, ease: "power2.in" }, 1);
      gsap.fromTo(
        "[data-cc-line]",
        { yPercent: 110 },
        { yPercent: 0, stagger: 0.1, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: section.current, start: "top 20%" } },
      );
    },
    { scope: section, dependencies: [reduced, ready] },
  );

  return (
    <section ref={section} className={reduced ? "relative h-[100svh]" : "relative h-[240svh]"} aria-labelledby="cc-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-night">
        <Image
          src="/media/hero/centre-court-1920.webp"
          alt="Centre Court lleno durante un partido sobre hierba"
          fill
          sizes="100vw"
          quality={85}
          className={`object-cover transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}
        />
        {!reduced && <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,18,17,0.6)_0%,rgba(18,18,17,0)_30%,rgba(18,18,17,0)_60%,rgba(18,18,17,0.7)_100%)]" />
        <div className="absolute inset-x-0 top-0 px-5 pt-24 text-paper md:px-[5vw] md:pt-28">
          <h2 id="cc-title" className="text-[clamp(2.8rem,8vw,8rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-cc-line className="block">
                El templo
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-cc-line className="block font-serif font-normal italic tracking-[-0.02em] text-silver">
                de la hierba.
              </span>
            </span>
          </h2>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-5 pb-8 text-paper md:flex-row md:items-end md:justify-between md:px-[5vw] md:pb-10">
          <p className="max-w-md text-[17px] leading-snug text-paper/80">
            Casi quince mil espectadores y una superficie que no perdona: bote bajo, bola rápida, tiempo justo. Ahí se nota cada gramo.
          </p>
          <p className="text-[11px] text-paper/55">Centre Court, 2026. Foto: danielcooper850, CC BY-SA 4.0, vía Wikimedia Commons. Escena 3D en tiempo real.</p>
        </div>
      </div>
    </section>
  );
}
