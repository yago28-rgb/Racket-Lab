import type { Metadata } from "next";
import { brandList } from "@/data/brands";
import { getAllRackets } from "@/lib/catalog";
import { mainPhoto } from "@/lib/media";
import { BrandIndex } from "@/components/brands/BrandIndex";

export const metadata: Metadata = {
  title: "Marcas de raquetas de tenis: Wilson, Babolat, HEAD, Yonex y más",
  description: "Wilson, Babolat, HEAD, Yonex, Tecnifibre, Dunlop y Prince: las familias de raquetas de cada marca en RACKET LAB.",
  alternates: { canonical: "/marcas" },
};

export default function BrandsPage() {
  const all = getAllRackets();
  const rows = brandList.map((b) => {
    const items = all.filter((r) => r.brand === b.id);
    const cover = items.find((r) => mainPhoto(r));
    return {
      id: b.id,
      name: b.name,
      country: b.country,
      families: [...new Set(items.map((r) => r.family))],
      count: items.length,
      photo: cover ? mainPhoto(cover) : null,
    };
  });
  return (
    <>
      <section className="container-rl grid gap-6 pb-14 pt-28 md:grid-cols-12 md:pb-20 md:pt-36">
        <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.05em] md:col-span-8">
          Marcas de <span className="font-serif font-normal italic tracking-[-0.02em] text-muted">raquetas.</span>
        </h1>
        <p className="self-end text-[17px] leading-relaxed text-muted md:col-span-4">
          Siete fabricantes y las familias que mejor representan cada filosofía de juego. Todas con especificaciones verificadas.
        </p>
      </section>
      <section className="container-rl pb-28" aria-label="Índice de marcas">
        <BrandIndex rows={rows} />
      </section>
    </>
  );
}
