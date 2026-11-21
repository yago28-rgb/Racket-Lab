import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Racket } from "@/types/product";
import { getAllRackets, getFeaturedRackets } from "@/lib/catalog";
import { brands } from "@/data/brands";
import { cn, formatPrice, levelRange, typeLabels } from "@/lib/format";
import { ShowcasePhoto } from "./ShowcasePhoto";

function specLine(r: Racket) {
  const s = r.specs;
  return [s.weightUnstrungG && `${s.weightUnstrungG} g`, s.headSizeSqIn && `${s.headSizeSqIn} in²`, s.balanceUnstrungMm && `${s.balanceUnstrungMm} mm`]
    .filter(Boolean)
    .join("  ·  ");
}

function Links({ r, dark }: { r: Racket; dark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[17px]">
      <Link
        href={`/raquetas/${r.slug}`}
        className={cn("group/l inline-flex items-center gap-0.5 font-medium", dark ? "text-cream hover:text-gold" : "text-club hover:text-accent-ink")}
      >
        Ver detalles <ChevronRight size={18} className="transition-transform group-hover/l:translate-x-0.5" />
      </Link>
      <Link
        href={`/raquetas?brand=${r.brand}`}
        className={cn("group/l inline-flex items-center gap-0.5", dark ? "text-cream/70 hover:text-gold" : "text-ink/60 hover:text-club")}
      >
        Más {brands[r.brand].name} <ChevronRight size={18} className="transition-transform group-hover/l:translate-x-0.5" />
      </Link>
    </div>
  );
}

/** A full-width stage for one racket. Alternates sides; text never boxed in a card. */
function Stage({ r, flip, tone, priority }: { r: Racket; flip?: boolean; tone: "mist" | "cream"; priority?: boolean }) {
  return (
    <article className={cn("group relative overflow-hidden", tone === "mist" ? "bg-mist" : "bg-cream")}>
      <div className={cn("grid min-h-[88svh] items-center gap-6 px-5 py-20 md:grid-cols-2 md:px-[6vw] md:py-0", flip && "md:[&>*:first-child]:order-2")}>
        <div className={cn("relative z-10", flip && "md:pl-[8%]")}>
          <p className="text-sm text-accent-ink">{brands[r.brand].name}</p>
          <h3 className="mt-3 font-serif text-[clamp(3.4rem,8.4vw,8.5rem)] font-medium leading-[0.86] tracking-[-0.03em] text-club">
            {r.model}
            <span className="block text-[0.42em] italic leading-tight tracking-normal text-club/55">{r.generation}</span>
          </h3>
          <p className="mt-8 max-w-sm text-[17px] leading-relaxed text-ink/70">
            {typeLabels[r.type]} para nivel {levelRange(r.levels).toLowerCase()}.
          </p>
          <p className="mt-2 font-mono text-[13px] tracking-wide text-ink/50">{specLine(r)}</p>
          <p className="mt-6 text-[17px] text-ink">{formatPrice(r.price.amount)}</p>
          <div className="mt-6">
            <Links r={r} />
          </div>
        </div>
        <ShowcasePhoto racket={r} priority={priority} sizes="(min-width: 768px) 50vw, 100vw" tilt={flip ? 9 : -9} className="h-[58svh] md:h-[80svh]" />
      </div>
    </article>
  );
}

function Tile({ r, tone }: { r: Racket; tone: "paper" | "mist" }) {
  return (
    <article className={cn("group relative flex min-h-[76svh] flex-col items-center overflow-hidden px-6 pt-14 text-center", tone === "paper" ? "bg-paper" : "bg-mist")}>
      <p className="text-sm text-accent-ink">{brands[r.brand].name}</p>
      <h3 className="mt-2 font-serif text-[clamp(2.6rem,4.4vw,4.2rem)] font-medium leading-[0.95] tracking-[-0.02em] text-club">
        {r.model} <span className="italic text-club/55">{r.generation}</span>
      </h3>
      <p className="mt-3 font-mono text-[13px] tracking-wide text-ink/50">{specLine(r)}</p>
      <div className="mt-5 flex justify-center">
        <Links r={r} />
      </div>
      <ShowcasePhoto racket={r} sizes="(min-width: 768px) 50vw, 100vw" tilt={-6} className="mt-4 w-full flex-1 min-h-[42svh]" />
    </article>
  );
}

/**
 * Product first: the line-up shown the way a flagship store would — each
 * racket on its own stage, no repeated card grid.
 */
export function Showcase() {
  const featured = getFeaturedRackets();
  const total = getAllRackets().length;
  const [a, b, ...rest] = featured;
  return (
    <section aria-labelledby="showcase-title">
      <div className="flex items-end justify-between gap-6 bg-paper px-5 pb-10 md:px-[6vw]">
        <h2 id="showcase-title" className="font-serif text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-none tracking-[-0.02em] text-club">
          La selección.
        </h2>
        <Link href="/raquetas" className="group inline-flex shrink-0 items-center gap-0.5 text-[17px] text-club hover:text-accent-ink">
          Ver las {total} <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {a && <Stage r={a} tone="mist" priority />}
      {b && <Stage r={b} tone="cream" flip />}
      {rest.length > 0 && (
        <div className="grid gap-px bg-line md:grid-cols-2">
          {rest.map((r, i) => (
            <Tile key={r.id} r={r} tone={i % 3 === 0 ? "paper" : "mist"} />
          ))}
        </div>
      )}
    </section>
  );
}
