import type { Racket } from "@/types/product";
import { brands } from "@/data/brands";
import { fullRacketName } from "@/lib/format";
import { mainPhoto } from "@/lib/media";
import { site } from "@/lib/site";

/** Absolute URL for structured data and Open Graph. */
export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}

/** Renders a JSON-LD block. `<` is escaped so the payload cannot close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function itemListLd(rackets: Racket[], name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: rackets.length,
    itemListElement: rackets.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/raquetas/${r.slug}`), name: fullRacketName(r) })),
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/icon.png"),
    areaServed: ["ES", "EU"],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "es-ES",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/raquetas")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Product markup. Only states what the catalogue has verified. */
export function productLd(r: Racket) {
  const photo = mainPhoto(r);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullRacketName(r),
    brand: { "@type": "Brand", name: brands[r.brand].name },
    description: r.description,
    sku: r.id,
    category: "Raquetas de tenis",
    url: absoluteUrl(`/raquetas/${r.slug}`),
    ...(photo && { image: [absoluteUrl(photo)] }),
    ...(r.price.amount != null && {
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: r.price.amount,
        availability: r.availability === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        url: absoluteUrl(`/raquetas/${r.slug}`),
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
    additionalProperty: [
      r.specs.weightUnstrungG && { "@type": "PropertyValue", name: "Peso sin encordar", value: r.specs.weightUnstrungG, unitCode: "GRM" },
      r.specs.headSizeSqIn && { "@type": "PropertyValue", name: "Tamaño de cabeza", value: r.specs.headSizeSqIn, unitText: "in²" },
      r.specs.balanceUnstrungMm && { "@type": "PropertyValue", name: "Balance sin encordar", value: r.specs.balanceUnstrungMm, unitCode: "MMT" },
      r.specs.pattern && { "@type": "PropertyValue", name: "Patrón de cordaje", value: `${r.specs.pattern.mains}×${r.specs.pattern.crosses}` },
      r.specs.stiffnessRA && { "@type": "PropertyValue", name: "Rigidez", value: r.specs.stiffnessRA, unitText: "RA" },
    ].filter(Boolean),
  };
}
