import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brandList } from "@/data/brands";
import { getAllRackets } from "@/lib/catalog";
import { ProductMedia } from "@/components/product/ProductMedia";
import { mainPhoto } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Marcas de raquetas de tenis: Wilson, Babolat, HEAD, Yonex y más",
  description: "Wilson, Babolat, HEAD, Yonex, Tecnifibre, Dunlop y Prince: las familias de raquetas de cada marca en RACKET LAB.",
  alternates: { canonical: "/marcas" },
};

export default function BrandsPage() {
  const all = getAllRackets();
  return (
    <>
      <section className="container-rl pb-14 pt-32 md:pt-40">
        <p className="eyebrow">Marcas</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,7vw,6rem)]">Marcas de raquetas.</h1>
        <p className="mt-5 max-w-xl text-lg text-ink/60">Las familias que mejor representan cada filosofía de juego, con datos verificados.</p>
      </section>
      <section className="container-rl pb-28">
        <ul className="grid gap-5 md:grid-cols-2">
          {brandList.map((b, i) => {
            const items = all.filter((r) => r.brand === b.id);
            const cover = items.find((r) => mainPhoto(r)) ?? items[0];
            const families = [...new Set(items.map((r) => r.family))];
            return (
              <Reveal as="li" key={b.id} delay={(i % 2) * 0.08}>
                <Link
                  href={`/marcas/${b.id}`}
                  className="group studio-bg relative flex h-72 overflow-hidden rounded-[var(--radius-card)] border border-line p-8 transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative z-10 flex flex-col">
                    <p className="text-xs text-muted">{b.country}</p>
                    <h2 className="display mt-1 text-4xl">{b.name}</h2>
                    <p className="mt-3 max-w-[16rem] text-sm text-ink/60">{families.join(" · ")}</p>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium">
                      {items.length} {items.length === 1 ? "modelo" : "modelos"}
                      <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <div className="absolute -bottom-4 right-0 h-[112%] w-1/2 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-rotate-2 group-hover:scale-105">
                    {cover && <ProductMedia racket={cover} sizes="(min-width: 768px) 25vw, 50vw" />}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </section>
    </>
  );
}
