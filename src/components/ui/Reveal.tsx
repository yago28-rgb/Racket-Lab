"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Fades/slides children in when they enter the viewport. Respects reduced motion. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}

/** Splits a headline into words that rise in sequence. Accessible: full text in aria-label. */
export function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const lines = text.split("\n");
  let i = 0;
  return (
    <span className={className} aria-label={text.replace("\n", " ")} role="text">
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((w) => {
            const idx = i++;
            return (
              <span key={idx} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={reduced ? false : { y: "105%" }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.9, delay: delay + idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
