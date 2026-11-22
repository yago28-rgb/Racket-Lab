import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getAllRackets, getRacketBySlug, getRelatedRackets, getSpecRanges } from "@/lib/catalog";
import { SpecVisual } from "@/components/product/SpecVisual";
import { catalogueProfiles } from "@/lib/recommendation/profile";
import { brands } from "@/data/brands";
import { formatPrice, fullRacketName, levelRange, styleLabels, typeLabels } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { SpecTable } from "@/components/product/SpecTable";
import { ProfileBars } from "@/components/product/ProfileBars";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { BlurInText } from "@/components/ui/motion-kit";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd, breadcrumbLd, productLd } from "@/lib/seo";

export function generateStaticParams() {
  return getAllRackets().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/raquetas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = getRacketBySlug(slug);
  if (!r) return {};
  const name = fullRacketName(r);
  const specs = [r.specs.weightUnstrungG && `${r.specs.weightUnstrungG} g`, r.specs.headSizeSqIn && `${r.specs.headSizeSqIn} in²`, r.specs.balanceUnstrungMm && `balance ${r.specs.balanceUnstrungMm} mm`, r.specs.pattern && `patrón ${r.specs.pattern.mains}×${r.specs.pattern.crosses}`]
    .filter(Boolean)
    .join(", ");
  const title = `${name}: especificaciones y precio`;
  const description = `Raqueta de tenis ${name}. ${specs}. ${r.description}`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/raquetas/${r.slug}` },
    openGraph: { title: `${name} · RACKET LAB`, description: r.description, type: "website", url: `/raquetas/${r.slug}` },
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

  const crumbs = [
    { name: "Inicio", path: "/" },
    { name: "Raquetas", path: "/raquetas" },
    { name: brand.name, path: `/marcas/${r.brand}` },
    { name: `${r.model} ${r.generation}`, path: `/raquetas/${r.slug}` },
  ];

  return (
    <>
      <JsonLd data={productLd(r)} />
      <JsonLd data={breadcrumbLd(crumbs)} />
      <div className="container-rl pt-16 md:pt-20">
        <Breadcrumbs items={crumbs} />
      </div>

      <section className="container-rl grid gap-10 pb-24 pt-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ProductGallery racket={r} />
        </div>

        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] text-stone">
            {brand.name} · {r.family}
          </p>
          <h1 className="mt-4 text-[clamp(3rem,6vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
            {r.model}
            <span className="block font-serif text-[0.6em] font-normal italic leading-tight tracking-[-0.01em] text-muted">{r.generation}</span>
          </h1>
          <p className="mt-2 text-muted">{r.variant}</p>
          <p className={`mt-6 text-2xl ${r.price.amount == null ? "text-muted" : "font-semibold"}`}>{formatPrice(r.price.amount)}</p>
          {r.price.amount != null && <p className="text-xs text-muted">IVA incluido</p>}

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-line px-3 py-1.5">{typeLabels[r.type]}</span>
            <span className="rounded-full border border-line px-3 py-1.5">{levelRange(r.levels)}</span>
            {r.styles.slice(0, 2).map((s) => (
              <span key={s} className="rounded-full border border-line px-3 py-1.5">
                {styleLabels[s]}
              </span>
            ))}
          </div>

          <p className="mt-8 text-lg leading-relaxed text-ink/75">
            <BlurInText text={r.description} delay={0.15} />
          </p>

          <div className="mt-10">
            <AddToCart racket={r} />
          </div>

        </div>
      </section>

      <section className="bg-night py-24 text-paper md:py-32" aria-labelledby="numbers-title">
        <div className="container-rl grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="numbers-title" className="text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
              Los números <span className="font-serif font-normal italic tracking-[-0.01em] text-silver">de la {r.model}.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[17px] leading-relaxed text-paper/65">
              Cada escala va del mínimo al máximo de las {getAllRackets().length} raquetas del catálogo, para que veas dónde se sitúa esta.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <SpecVisual racket={r} ranges={getSpecRanges()} tone="dark" />
          </div>
        </div>
      </section>

      <section className="container-rl grid gap-12 py-20 lg:grid-cols-12" aria-labelledby="sheet-title">
        <h2 id="sheet-title" className="text-[clamp(1.8rem,3vw,2.6rem)] font-semibold tracking-[-0.04em] lg:col-span-4">
          Ficha técnica <span className="font-serif font-normal italic text-muted">completa.</span>
        </h2>
        <div className="lg:col-span-7 lg:col-start-6">
          <SpecTable racket={r} />
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
        <h2 className="text-[clamp(2rem,4vw,3.4rem)] font-semibold tracking-[-0.045em]">También te puede <span className="font-serif font-normal italic text-muted">interesar.</span></h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((x) => (
            <li key={x.id}>
              <ProductCard racket={x} index={related.indexOf(x)} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
