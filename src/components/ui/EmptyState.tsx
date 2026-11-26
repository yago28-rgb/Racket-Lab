"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

const ease = [0.76, 0, 0.24, 1] as const;

/**
 * Editorial empty state: a statement, one primary action, one quiet link,
 * and a real photograph that opens from the bottom — never a lone icon.
 */
export function EmptyState({
  title,
  accent,
  text,
  primary,
  secondary,
  image = "/media/video/hero-stadium-poster.webp",
  alt = "Jugador sacando en una pista de estadio",
}: {
  title: string;
  accent: string;
  text: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  image?: string;
  alt?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <section className="container-rl grid items-center gap-10 pb-24 pt-4 md:grid-cols-12 md:gap-12 md:pb-32">
      <div className="md:col-span-5">
        <h2 className="text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
          {title} <span className="font-serif font-normal italic tracking-[-0.01em] text-muted">{accent}</span>
        </h2>
        <p className="mt-6 max-w-sm text-[17px] leading-relaxed text-muted">{text}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href={primary.href} className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-[16px] text-paper transition-colors hover:bg-club">
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="group inline-flex items-center gap-0.5 text-[16px] text-club hover:underline">
              {secondary.label} <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
      <motion.div
        className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-night md:col-span-7"
        initial={reduced ? false : { clipPath: "inset(100% 0% 0% 0% round 28px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 28px)" }}
        transition={{ duration: 1.1, ease }}
      >
        <motion.div className="absolute inset-0" initial={reduced ? false : { scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease }}>
          <Image src={image} alt={alt} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
        </motion.div>
      </motion.div>
    </section>
  );
}
