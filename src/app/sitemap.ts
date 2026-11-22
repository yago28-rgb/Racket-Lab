import type { MetadataRoute } from "next";
import { getAllRackets } from "@/lib/catalog";
import { brandList } from "@/data/brands";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const rackets = getAllRackets();
  const latest = rackets.map((r) => r.verifiedAt).sort().at(-1);
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "weekly") => ({
    url: `${site.url}${path}`,
    lastModified: latest,
    changeFrequency,
    priority,
  });
  return [
    page("", 1),
    page("/raquetas", 0.9),
    page("/marcas", 0.7),
    ...brandList.map((b) => page(`/marcas/${b.id}`, 0.8)),
    page("/racket-finder", 0.8),
    page("/comparar", 0.5),
    ...rackets.map((r) => ({ url: `${site.url}/raquetas/${r.slug}`, lastModified: r.verifiedAt, changeFrequency: "monthly" as const, priority: 0.8 })),
    page("/contacto", 0.3, "yearly"),
    page("/envios", 0.3, "yearly"),
    page("/privacidad", 0.1, "yearly"),
    page("/creditos", 0.1, "yearly"),
  ];
}
