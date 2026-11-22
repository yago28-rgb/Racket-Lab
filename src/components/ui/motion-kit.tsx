"use client";

/**
 * Motion primitives inspired by patterns popular on 21st.dev (Magic UI / Aceternity)
 * and motionsites-style landing pages — re-implemented with Motion + CSS, no SVG.
 * Every effect degrades to a static state under prefers-reduced-motion.
 */
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { usePrefersReducedMotion } from "@/hooks/useReducedMotion";

/** Thin accent bar showing reading progress (top of the viewport). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent" style={{ scaleX }} />;
}

/** Counts up to `value` when scrolled into view (Magic UI "Number Ticker"). */
export function NumberTicker({ value, className, duration = 1.6 }: { value: number; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  // SSR-safe: hydrates with the server value, then jumps to the final number.
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const c = animate(0, value, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduced, value, duration]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {reduced ? value : n}
    </span>
  );
}

/** Pulls its child slightly towards the cursor (magnetic buttons). */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Infinite marquee whose speed and direction react to scroll velocity
 * (Magic UI "Marquee" + "Scroll-based velocity").
 */
export function VelocityMarquee({ children, baseSpeed = 40, className }: { children: ReactNode; baseSpeed?: number; className?: string }) {
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-2000, 0, 2000], [-4, 1, 4], { clamp: false });
  const paused = useRef(false);

  useAnimationFrame((_, delta) => {
    if (reduced || paused.current || !track.current) return;
    const half = track.current.scrollWidth / 2;
    if (!half) return;
    let next = x.get() - (baseSpeed * (delta / 1000) * (factor.get() || 1));
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  return (
    <div
      className={cn("overflow-hidden", className)}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <motion.div ref={track} className="flex w-max" style={{ x }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Card with a cursor-following spotlight and subtle 3D tilt
 * (Aceternity "Card Spotlight" + "3D Card"), pure CSS transforms.
 */
export function SpotlightTilt({ children, className, tilt = 6 }: { children: ReactNode; className?: string; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(0, { stiffness: 180, damping: 20 });
  const ry = useSpring(0, { stiffness: 180, damping: 20 });
  const [spot, setSpot] = useState<{ x: number; y: number } | null>(null);
  return (
    <motion.div
      ref={ref}
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = ref.current!.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * tilt * 2);
        rx.set(-(py - 0.5) * tilt * 2);
        setSpot({ x: px * 100, y: py * 100 });
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
        setSpot(null);
      }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: spot ? 1 : 0,
          background: spot ? `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.4), transparent 45%)` : undefined,
        }}
      />
    </motion.div>
  );
}

/** Words fade in from blur, staggered (21st.dev "Text Generate Effect"). */
export function BlurInText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={reduced ? false : { opacity: 0, filter: "blur(10px)", y: 8 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: delay + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}
