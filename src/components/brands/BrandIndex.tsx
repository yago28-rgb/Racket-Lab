"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export interface BrandRow {
  id: string;
  name: string;
  country: string;
  families: string[];
  count: number;
  photo: string | null;
}

/**
 * Editorial index of brands. Each row is set large; on desktop a real photo
 * of one of the brand's rackets follows the cursor while a row is hovered.
 */
export function BrandIndex({ rows }: { rows: BrandRow[] }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const x = useSpring(0, { stiffness: 260, damping: 28, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 28, mass: 0.6 });
  const current = hover != null ? rows[hover] : null;

  return (
    <div className="relative">
      <ul
        className="border-t border-line"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          x.set(e.clientX);
          y.set(e.clientY);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {rows.map((b, i) => (
          <li key={b.id} onPointerEnter={() => setHover(i)}>
            <Link
              href={`/marcas/${b.id}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-6 md:grid-cols-[minmax(0,1fr)_16rem_14rem_auto] md:gap-8 md:py-8"
            >
              <span className="flex items-baseline gap-4">
                <span className="w-8 text-[12px] tabular-nums text-stone">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[clamp(2.4rem,6.4vw,6rem)] font-semibold leading-none tracking-[-0.05em] transition-[letter-spacing,color] duration-500 ease-[var(--ease-out-expo)] group-hover:tracking-[-0.03em] group-hover:text-club">
                  {b.name}
                </span>
              </span>
              <span className="hidden text-[15px] text-muted md:block">{b.families.join(" · ")}</span>
              <span className="hidden text-[13px] uppercase tracking-[0.18em] text-stone md:block">
                {b.country} · {b.count} {b.count === 1 ? "modelo" : "modelos"}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-all duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Cursor-following real photo (desktop, fine pointer only). */}
      {!reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-30 hidden h-72 w-56 md:block"
          style={{ x, y, translateX: "-50%", translateY: "-50%" }}
          animate={{ opacity: current?.photo ? 1 : 0, scale: current?.photo ? 1 : 0.85, rotate: current?.photo ? -8 : 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-mist shadow-[0_30px_60px_-25px_rgba(0,0,0,0.35)]">
            {current?.photo && <Image key={current.photo} src={current.photo} alt="" fill sizes="224px" className="object-contain p-3 mix-blend-multiply" />}
          </div>
        </motion.div>
      )}
    </div>
  );
}
