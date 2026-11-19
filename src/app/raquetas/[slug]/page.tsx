import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAllRackets, getRacketBySlug, getRelatedRackets } from "@/lib/catalog";
import { catalogueProfiles } from "@/lib/recommendation/profile";
import { brands } from "@/data/brands";
import { formatPrice, fullRacketName, levelRange, styleLabels, typeLabels } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { SpecTable } from "@/components/product/SpecTable";
import { ProfileBars } from "@/components/product/ProfileBars";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return getAllRackets().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/raquetas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = getRacketBySlug(slug);
  if (!r) return {};
  const title = fullRacketName(r);
  return {
    title,
    description: `${title}: ${r.specs.weightUnstrungG ?? "?"} g, ${r.specs.headSizeSqIn ?? "?"} in². ${r.description}`,
    alternates: { canonical: `/raquetas/${r.slug}` },
    openGraph: { title: `${title} · ${site.name}`, description: r.description, type: "website" },
  };
}

function stringGuidance(stiffness: number | null, pattern: { mains: number; crosses: number } | null) {
  const out: string[] = [];
  if (pattern && pattern.mains * pattern.crosses <= 304) {
    out.push("Patrón abierto: un poliéster de sección redonda o con perfil facilita el efecto; se mueve y pierde tensión antes que en un patrón denso.");
  } else if (pattern) {
    out.push("Patrón denso: el lecho es más firme; un multifilamento o un poliéster suave compensa la menor salida de bola.");
  }
  if (stiffness != null && stiffness >= 68) {
    out.push(`Marco rígido (${stiffness} RA): si notas vibración en el brazo, combina con multifilamento, tripa natural o un híbrido.`);
  } else if (stiffness != null && stiffness <= 62) {
    out.push(`Marco flexible (${stiffness} RA): admite bien el poliéster sin penalizar en exceso la comodidad.`);
  }
  out.push("La tensión depende de la cuerda y de tus preferencias: más tensión aporta control, menos tensión aporta potencia y comodidad.");
  return out;
}

export default async function ProductPage({ params }: PageProps<"/raquetas/[slug]">) {
  const { slug } = await params;
  const r = getRacketBySlug(slug);
  if (!r) notFound();

  const profile = catalogueProfiles(getAllRackets()).get(r.id)!.values;
  const related = getRelatedRackets(r);
  const brand = brands[r.brand];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullRacketName(r),
    brand: { "@type": "Brand", name: brand.name },
    description: r.description,
    sku: r.id,
    category: "Raquetas de tenis",
    ...(r.price.amount != null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: r.price.amount,
        availability: r.availability === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        url: `${site.url}/raquetas/${r.slug}`,
      },
    }),
    additionalProperty: [
      r.specs.weightUnstrungG && { "@type": "PropertyValue", name: "Peso sin encordar", value: r.specs.weightUnstrungG, unitCode: "GRM" },
      r.specs.headSizeSqIn && { "@type": "PropertyValue", name: "Tamaño de cabeza", value: r.specs.headSizeSqIn, unitText: "in²" },
    ].filter(Boolean),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-rl pt-20 md:pt-24">
        <Link href="/raquetas" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={15} /> Catálogo
        </Link>
      </div>

      <section className="container-rl grid gap-10 pb-20 pt-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ProductGallery racket={r} />
        </div>

        <div>
          <p className="eyebrow">
            {brand.name} · {r.family}
          </p>
          <h1 className="display mt-4 text-[clamp(2.4rem,5vw,4rem)]">
            {r.model} <span className="text-ink/35">{r.generation}</span>
          </h1>
          <p className="mt-2 text-muted">{r.variant}</p>
          <p className={`mt-6 text-2xl ${r.price.amount == null ? "text-muted" : "font-semibold"}`}>{formatPrice(r.price.amount)}</p>
          {r.price.amount != null && <p className="text-xs text-muted">IVA incluido</p>}

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-cloud px-3 py-1.5">{typeLabels[r.type]}</span>
            <span className="rounded-full bg-cloud px-3 py-1.5">{levelRange(r.levels)}</span>
            {r.styles.slice(0, 2).map((s) => (
              <span key={s} className="rounded-full bg-cloud px-3 py-1.5">
                {styleLabels[s]}
              </span>
            ))}
          </div>

          <p className="mt-8 text-lg leading-relaxed text-ink/75">{r.description}</p>

          <div className="mt-10">
            <AddToCart racket={r} />
          </div>

          <div className="mt-14">
            <h2 className="text-lg font-semibold tracking-tight">Especificaciones</h2>
            <div className="mt-4">
              <SpecTable racket={r} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="container-rl grid gap-14 md:grid-cols-3">
          <Reveal>
            <h2 className="text-lg font-semibold tracking-tight">Perfil de juego</h2>
            <p className="mt-2 text-sm text-muted">Calculado a partir de sus especificaciones, relativo al resto del catálogo.</p>
            <div className="mt-6">
              <ProfileBars profile={profile} />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-lg font-semibold tracking-tight">Tecnologías</h2>
            {r.technologies.length ? (
              <ul className="mt-6 space-y-3 text-sm">
                {r.technologies.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" /> {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm italic text-muted">Pendiente de verificar con el fabricante.</p>
            )}
            <h3 className="mt-10 text-sm font-semibold">Recomendaciones de cuerda</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink/75">
              {stringGuidance(r.specs.stiffnessRA, r.specs.pattern).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.16}>
            <h2 className="text-lg font-semibold tracking-tight">Datos y fuentes</h2>
            <p className="mt-2 text-sm text-muted">Verificado el {new Date(r.verifiedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}.</p>
            {r.dataNotes.length > 0 && (
              <ul className="mt-6 space-y-3 text-sm text-ink/75">
                {r.dataNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
            <ul className="mt-6 space-y-2 text-sm">
              {r.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
                    {s.label} <ExternalLink size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="container-rl py-24">
        <h2 className="display text-[clamp(1.8rem,4vw,3rem)]">También te puede interesar</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((x) => (
            <li key={x.id}>
              <ProductCard racket={x} uid="related" />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
