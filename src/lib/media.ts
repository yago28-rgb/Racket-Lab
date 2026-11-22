import type { Racket } from "@/types/product";
import photos from "@/data/photos.generated.json";

/**
 * Product photography is saved locally by the owner in /public/fotos (git-ignored,
 * see FOTOS.md). `scripts/scan-photos.mjs` writes the manifest before dev/build,
 * so the UI only ever references files that exist.
 */
const manifest = photos as Record<string, string[]>;

export function productPhotos(r: Pick<Racket, "slug" | "image" | "gallery">): string[] {
  const local = manifest[r.slug] ?? [];
  const declared = [r.image, ...r.gallery].filter((x): x is string => Boolean(x));
  return [...new Set([...local, ...declared])];
}

export function mainPhoto(r: Pick<Racket, "slug" | "image" | "gallery">): string | null {
  return productPhotos(r)[0] ?? null;
}

export function photoCount(): number {
  return Object.values(manifest).reduce((n, l) => n + l.length, 0);
}

export const videos = {
  playerReady: { base: "/media/video/player-ready", label: "Jugador en posición de resto, pista dura al atardecer" },
  aerialServe: { base: "/media/video/finder-aerial-serve", label: "Vista cenital de un saque" },
  aerialCourt: { base: "/media/video/aerial-court", label: "Vista cenital de un partido de dobles" },
  playerBacklit: { base: "/media/video/player-backlit", label: "Jugadora golpeando a contraluz" },
  heroAerial: { base: "/media/video/hero-aerial", label: "Vista cenital de un jugador sacando" },
  heroForehand: { base: "/media/video/hero-forehand", label: "Primer plano de una derecha a contraluz" },
  heroStadium: { base: "/media/video/hero-stadium", label: "Jugador sacando en una pista de estadio" },
} as const;
