import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Racket } from "@/types/product";
import { getAllRackets, getFeaturedRackets, getSpecRanges } from "@/lib/catalog";
import { brands } from "@/data/brands";
import { cn, formatPrice, typeLabels } from "@/lib/format";
import { SpecVisual } from "@/components/product/SpecVisual";
import { ProductCard } from "@/components/product/ProductCard";
import { ShowcasePhoto } from "./ShowcasePhoto";

function firstSentence(t: string) {
  const i = t.indexOf(". ");
  return i > 0 ? t.slice(0, i + 1) : t;
}

/** A magazine spread for one racket: the frame huge on one page, the data on the facing page. */
function Spread({ r, flip, n, priority }: { r: Racket; flip?: boolean; n: number; priority?: boolean }) {
  const ranges = getSpecRanges();
  return (
    <article className="group grid min-h-[100svh] items-stretch md:grid-cols-12">
      <div className={cn("relative min-h-[70svh] overflow-clip bg-mist md:col-span-7", flip && "md:order-2")}>
        <span className="absolute left-5 top-5 z-10 hidden text-[11px] md:block uppercase tracking-[0.2em] text-stone md:left-8 md:top-8">
          {String(n).padStart(2, "0")} / {typeLabels[r.type]}
        </span>
        <div className="h-[70svh] bg-mist p-[3%] md:sticky md:top-0 md:h-[100svh]">
          <ShowcasePhoto racket={r} priority={priority} sizes="(min-width: 768px) 58vw, 100vw" tilt={flip ? 14 : -14} className="h-full w-full" />
        </div>
      </div>
      <div className={cn("flex flex-col justify-center px-5 py-16 md:col-span-5 md:px-[4vw] md:py-24", flip && "md:order-1")}>
        <p className="text-[12px] uppercase tracking-[0.2em] text-stone">{brands[r.brand].name}</p>
        <h3 className="mt-3 text-[clamp(3rem,6.2vw,6.4rem)] font-semibold leading-[0.88] tracking-[-0.05em]">
          {r.model}
          <span className="block font-serif text-[0.62em] font-normal italic leading-tight tracking-[-0.01em] text-muted">{r.generation}</span>
        </h3>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft">{firstSentence(r.description)}</p>
        <SpecVisual racket={r} ranges={ranges} className="mt-8" />
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href={`/raquetas/${r.slug}`} className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-[16px] text-paper transition-colors hover:bg-club">
            Ver la {r.model}
          </Link>
          <span className={r.price.amount == null ? "text-[15px] text-muted" : "text-[17px] font-semibold tabular-nums"}>{formatPrice(r.price.amount)}</span>
        </div>
      </div>
    </article>
  );
}

/** Product first, presented as an editorial: two spreads, then an asymmetric grid. */
export function Showcase() {
  const featured = getFeaturedRackets();
  const total = getAllRackets().length;
  const [a, b, ...rest] = featured;
  return (
    <section id="seleccion" aria-labelledby="showcase-title" className="scroll-mt-12 bg-paper">
      <header className="grid gap-6 px-5 pb-14 pt-10 md:grid-cols-12 md:px-[5vw] md:pb-20">
        <h2 id="showcase-title" className="text-[clamp(2.6rem,6vw,6rem)] font-semibold leading-[0.9] tracking-[-0.05em] md:col-span-8">
          La selección <span className="font-serif font-normal italic tracking-[-0.02em] text-muted">de la temporada.</span>
        </h2>
        <div className="flex flex-col justify-end gap-4 md:col-span-4">
          <p className="text-[17px] leading-relaxed text-muted">
            {featured.length} raquetas que cubren todos los perfiles: potencia, efecto, control y equilibrio.
          </p>
          <Link href="/raquetas" className="group inline-flex items-center gap-0.5 text-[17px] text-club hover:underline">
            Ver las {total} raquetas <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>
      {a && <Spread r={a} n={1} priority />}
      {b && <Spread r={b} n={2} flip />}
      {rest.length > 0 && (
        <div className="grid gap-4 px-3 py-4 md:grid-cols-12 md:px-4">
          {rest.map((r, i) => (
            <div key={r.id} className={cn(i % 4 === 0 || i % 4 === 3 ? "md:col-span-7" : "md:col-span-5", i % 2 === 1 && "md:mt-24")}>
              <ProductCard racket={r} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
