import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { brandList, brands } from "@/data/brands";
import { getAllRackets } from "@/lib/catalog";
import type { BrandId } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd, breadcrumbLd, itemListLd } from "@/lib/seo";
import { fullRacketName, typeLabels } from "@/lib/format";

export function generateStaticParams() {
  return brandList.map((b) => ({ brand: b.id }));
}

function data(id: string) {
  const brand = brands[id as BrandId];
  if (!brand) return null;
  const rackets = getAllRackets().filter((r) => r.brand === brand.id);
  const families = [...new Set(rackets.map((r) => r.family))];
  return { brand, rackets, families };
}

export async function generateMetadata({ params }: PageProps<"/marcas/[brand]">): Promise<Metadata> {
  const { brand: id } = await params;
  const d = data(id);
  if (!d) return {};
  const title = `Raquetas de tenis ${d.brand.name}: ${d.families.join(", ")}`;
  const description = `${d.rackets.length} raquetas ${d.brand.name} con especificaciones verificadas: ${d.rackets
    .map((r) => fullRacketName(r).replace(`${d.brand.name} `, ""))
    .join(", ")}. Compara peso, balance, cabeza y rigidez.`;
  return {
    title,
    description,
    alternates: { canonical: `/marcas/${d.brand.id}` },
    openGraph: { title, description, url: `/marcas/${d.brand.id}` },
  };
}

export default async function BrandPage({ params }: PageProps<"/marcas/[brand]">) {
  const { brand: id } = await params;
  const d = data(id);
  if (!d) notFound();
  const { brand, rackets, families } = d;
  const types = [...new Set(rackets.map((r) => typeLabels[r.type].toLowerCase()))];
  const crumbs = [
    { name: "Inicio", path: "/" },
    { name: "Marcas", path: "/marcas" },
    { name: brand.name, path: `/marcas/${brand.id}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={itemListLd(rackets, `Raquetas ${brand.name}`)} />
      <section className="container-rl pb-12 pt-20 text-center md:pt-24">
        <Breadcrumbs items={crumbs} className="justify-center" />
        <h1 className="display mt-8 text-[clamp(2.6rem,7vw,5.5rem)]">Raquetas {brand.name}.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[clamp(1.1rem,1.6vw,1.4rem)] leading-snug text-muted">
          {rackets.length} {rackets.length === 1 ? "modelo" : "modelos"} de las familias {families.join(", ")}: raquetas de {types.join(", ")}.
          Fabricante de {brand.country}. Cada especificación está verificada con su fuente.
        </p>
        <Link href={`/raquetas?brand=${brand.id}`} className="group mt-6 inline-flex items-center gap-0.5 text-[17px] text-club hover:underline">
          Filtrar en el catálogo <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
      <section className="container-rl pb-28" aria-label={`Modelos ${brand.name}`}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rackets.map((r) => (
            <li key={r.id}>
              <ProductCard racket={r} />
            </li>
          ))}
        </ul>
        <nav aria-label="Otras marcas" className="mt-20 border-t border-line pt-8">
          <p className="text-[15px] font-semibold">Otras marcas</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {brandList
              .filter((b) => b.id !== brand.id)
              .map((b) => (
                <li key={b.id}>
                  <Link href={`/marcas/${b.id}`} className="text-club hover:underline">
                    Raquetas {b.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </section>
    </>
  );
}
