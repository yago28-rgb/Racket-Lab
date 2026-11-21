"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import type { Racket } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { WordReveal } from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * motionsites-style pinned horizontal gallery: on desktop the section pins and
 * vertical scroll drives the rail sideways (GSAP ScrollTrigger, scrubbed).
 * Mobile / reduced motion: native horizontal swipe with scroll-snap.
 */
export function FeaturedRail({ rackets, more }: { rackets: Racket[]; more: number }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - el.clientWidth;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} className="overflow-hidden bg-mist py-24 lg:flex lg:h-[100svh] lg:flex-col lg:justify-center lg:pb-6 lg:pt-20" aria-labelledby="featured-title">
      <div className="container-rl flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Selección</p>
          <h2 id="featured-title" className="display mt-5 text-[clamp(2.2rem,5vw,4rem)]">
            <WordReveal text={"The line-up."} />
          </h2>
          <p className="mt-4 max-w-md text-ink/60">{rackets.length} referencias que cubren todos los perfiles: potencia, efecto, control y equilibrio.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-3 lg:flex" aria-hidden>
            <span className="font-mono text-xs tabular-nums text-muted">{String(Math.min(rackets.length, Math.floor(progress * rackets.length) + 1)).padStart(2, "0")}</span>
            <span className="h-px w-24 overflow-hidden bg-line">
              <span className="block h-full bg-gold" style={{ width: `${Math.max(4, progress * 100)}%` }} />
            </span>
            <span className="font-mono text-xs tabular-nums text-muted">{String(rackets.length).padStart(2, "0")}</span>
          </div>
          <Link href="/raquetas" className="group inline-flex items-center gap-2 text-sm font-medium">
            Ver catálogo completo
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div
        ref={track}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:px-10 lg:snap-none lg:overflow-visible lg:px-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))] [&::-webkit-scrollbar]:hidden"
      >
        {rackets.map((r) => (
          <div key={r.id} className="w-[78vw] shrink-0 snap-center sm:w-[44vw] lg:w-[min(300px,calc((100svh-18rem)*0.62))]">
            <ProductCard racket={r} />
          </div>
        ))}
        <Link
          href="/raquetas"
          className="flex w-[60vw] shrink-0 snap-center flex-col justify-end rounded-[var(--radius-card)] bg-club p-8 text-cream transition-colors hover:bg-night sm:w-[30vw] lg:w-[300px]"
        >
          <span className="text-5xl font-semibold tracking-tight">+{more}</span>
          <span className="mt-2 text-white/60">modelos más en el catálogo</span>
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium">
            Explorar <ArrowRight size={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
