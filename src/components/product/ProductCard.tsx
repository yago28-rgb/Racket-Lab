import Link from "next/link";
import type { Racket } from "@/types/product";
import { brands } from "@/data/brands";
import { formatPrice, levelRange, typeLabels } from "@/lib/format";
import { CompareToggle } from "./CompareToggle";
import { CardMedia } from "./CardMedia";
import { SpotlightTilt } from "@/components/ui/motion-kit";
import { cn } from "@/lib/format";

function specs(r: Racket) {
  const s = r.specs;
  return [s.weightUnstrungG && `${s.weightUnstrungG} g`, s.headSizeSqIn && `${s.headSizeSqIn} in²`, s.balanceUnstrungMm && `${s.balanceUnstrungMm} mm`, s.pattern && `${s.pattern.mains}×${s.pattern.crosses}`]
    .filter(Boolean)
    .join("  ·  ");
}

/**
 * Product card: the racket is the composition. Stone background, the frame
 * on the diagonal, type set like a magazine caption underneath.
 */
export function ProductCard({ racket, index = 0, size = "md" }: { racket: Racket; index?: number; size?: "md" | "lg" }) {
  return (
    <SpotlightTilt className="h-full rounded-[24px]" tilt={5}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-mist">
        <Link href={`/raquetas/${racket.slug}`} className="absolute inset-0 z-10" aria-label={`Ver ${brands[racket.brand].name} ${racket.model} ${racket.generation}`} />
        <div className={cn("relative overflow-hidden", size === "lg" ? "aspect-[1/1] sm:aspect-[2/1]" : "aspect-[1/1]")}>
          <CardMedia racket={racket} index={index} wide={size === "lg"} sizes={size === "lg" ? "(min-width: 1024px) 70vw, 100vw" : "(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"} />
          <span className="absolute left-5 top-5 text-[11px] uppercase tracking-[0.18em] text-muted">{typeLabels[racket.type]}</span>
          <div className="absolute right-4 top-4 z-20">
            <CompareToggle id={racket.id} label={false} className="h-9 w-9 justify-center !border-transparent !bg-paper/80 !p-0 backdrop-blur" />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-6 pb-6 pt-2">
          <p className="text-[12px] uppercase tracking-[0.18em] text-stone">{brands[racket.brand].name}</p>
          <h3 className={cn("mt-1 font-semibold leading-[1] tracking-[-0.035em]", size === "lg" ? "text-[clamp(2.2rem,3.4vw,3.4rem)]" : "text-[clamp(1.7rem,2.3vw,2.2rem)]")}>
            {racket.model} <span className="font-serif font-normal italic tracking-[-0.01em] text-muted">{racket.generation}</span>
          </h3>
          <p className="mt-3 text-[13px] tabular-nums text-muted">{specs(racket)}</p>
          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <p className="text-[13px] text-muted">{levelRange(racket.levels)}</p>
            <p className={racket.price.amount == null ? "text-[14px] text-muted" : "text-[17px] font-semibold tabular-nums"}>{formatPrice(racket.price.amount)}</p>
          </div>
        </div>
      </article>
    </SpotlightTilt>
  );
}
