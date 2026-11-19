"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/format";

/** Full-bleed photographic page header with subtle scroll parallax. */
export function PhotoHeader({
  src,
  alt,
  children,
  className,
  position = "center",
}: {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
  position?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1.04, 1.14]);
  return (
    <header ref={ref} className={cn("relative overflow-hidden bg-night text-white", className)}>
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/25" />
      <div className="container-rl relative">{children}</div>
    </header>
  );
}
