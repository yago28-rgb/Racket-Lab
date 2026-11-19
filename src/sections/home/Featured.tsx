import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedRackets } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal, WordReveal } from "@/components/ui/Reveal";

export function Featured() {
  const items = getFeaturedRackets();
  return (
    <section className="bg-mist py-28 md:py-36" aria-labelledby="featured-title">
      <div className="container-rl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Selección</p>
            <h2 id="featured-title" className="display mt-5 text-[clamp(2.2rem,5vw,4rem)]">
              <WordReveal text={"The line-up."} />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-4 max-w-md text-ink/60">
                Seis referencias que cubren todos los perfiles: potencia, efecto, control y equilibrio.
              </p>
            </Reveal>
          </div>
          <Reveal>
            <Link href="/raquetas" className="group inline-flex items-center gap-2 text-sm font-medium">
              Ver catálogo completo
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r, i) => (
            <Reveal as="li" key={r.id} delay={(i % 3) * 0.08}>
              <ProductCard racket={r} uid="featured" />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
