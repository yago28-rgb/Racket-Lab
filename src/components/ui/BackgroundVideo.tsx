"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/format";

/**
 * Decorative background video (WebM + MP4, muted, looping, inline).
 * - Loads lazily (preload="none") and only plays while on screen.
 * - With prefers-reduced-motion it stays on the poster frame.
 */
export function BackgroundVideo({ base, label, className, priority = false }: { base: string; label: string; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== "auto") v.preload = "auto";
          v.play().catch(() => {
            /* autoplay may be blocked; the poster remains visible */
          });
        } else v.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      className={cn("pointer-events-none h-full w-full object-cover", className)}
      poster={`${base}-poster.webp`}
      muted
      loop
      playsInline
      preload={priority ? "auto" : "none"}
      aria-label={label}
      disablePictureInPicture
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}
