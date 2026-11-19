import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getAllRackets } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Raquetas de tenis",
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
      <section className="container-rl pb-10 pt-32 md:pt-40">
        <p className="eyebrow">Catálogo · {count} modelos</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,7vw,6rem)]">Raquetas.</h1>
        <p className="mt-5 max-w-xl text-lg text-ink/60">
          Especificaciones verificadas con fuentes. Cuando un dato no se ha podido confirmar, lo indicamos como pendiente en
          lugar de inventarlo.
        </p>
      </section>
      <Suspense fallback={<GridSkeleton />}>
        <CatalogView />
      </Suspense>
    </>
  );
}
