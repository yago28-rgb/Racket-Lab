import type { MetadataRoute } from "next";
import { getAllRackets } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/raquetas", "/racket-finder", "/comparar", "/marcas", "/contacto", "/envios", "/privacidad", "/creditos"];
  return [
    ...staticRoutes.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...getAllRackets().map((r) => ({
      url: `${site.url}/raquetas/${r.slug}`,
      lastModified: r.verifiedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
