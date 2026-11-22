import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getAllRackets } from "@/lib/catalog";
import { PhotoHeader } from "@/components/ui/PhotoHeader";
import { BlurInText } from "@/components/ui/motion-kit";
import { JsonLd, itemListLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Raquetas de tenis: catálogo con especificaciones verificadas",
  description:
    "Catálogo de raquetas Wilson, Babolat, HEAD, Yonex, Tecnifibre, Dunlop y Prince con especificaciones verificadas: peso, balance, cabeza, rigidez y swingweight.",
  alternates: { canonical: "/raquetas" },
};

function GridSkeleton() {
  return (
    <div className="container-rl pb-28">
      <div className="mb-8 h-16 border-b border-line" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:pl-[300px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/6] animate-pulse rounded-[var(--radius-card)] bg-cloud" />
        ))}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const count = getAllRackets().length;
  return (
    <>
      <JsonLd data={itemListLd(getAllRackets(), "Raquetas de tenis")} />
      <PhotoHeader src="/media/video/hero-aerial-poster.webp" alt="Vista cenital de un jugador sacando en pista dura" position="center 20%">
        <div className="pb-14 pt-40 md:pb-20 md:pt-52">
          <p className="eyebrow !text-white/60">Catálogo · {count} modelos</p>
          <h1 className="display mt-5 text-[clamp(2.6rem,7vw,6rem)]">Raquetas de tenis.</h1>
          <p className="mt-5 max-w-xl text-lg text-white/75">
            <BlurInText text="Especificaciones verificadas con fuentes. Cuando un dato no se ha podido confirmar, lo indicamos como pendiente en lugar de inventarlo." delay={0.2} />
          </p>
        </div>
      </PhotoHeader>
      <div className="h-6" />
      <Suspense fallback={<GridSkeleton />}>
        <CatalogView />
      </Suspense>
    </>
  );
}
