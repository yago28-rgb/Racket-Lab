import Image from "next/image";
import type { Racket } from "@/types/product";
import { brands } from "@/data/brands";
import { cn, fullRacketName } from "@/lib/format";
import { productPhotos } from "@/lib/media";

/**
 * Real product photo (saved locally, see FOTOS.md). Without a photo it shows a
 * neutral, typographic "photo pending" panel — never a generated image.
 */
export function ProductMedia({
  racket,
  className,
  index = 0,
  priority,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  tone = "light",
}: {
  racket: Racket;
  className?: string;
  index?: number;
  priority?: boolean;
  sizes?: string;
  tone?: "light" | "dark";
}) {
  const list = productPhotos(racket);
  const src = list[index] ?? list[0];
  if (src) {
    return <Image src={src} alt={fullRacketName(racket)} fill sizes={sizes} priority={priority} className={cn("object-contain p-[6%]", tone === "light" && "mix-blend-multiply", className)} />;
  }
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center",
        tone === "dark" ? "text-white/45" : "text-ink/35",
      )}
      role="img"
      aria-label={`Foto pendiente de ${fullRacketName(racket)}`}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.22em]">{brands[racket.brand].name}</span>
      <span className="text-xl font-semibold tracking-tight">{racket.model}</span>
      <span className="mt-2 rounded-full border border-current px-3 py-1 text-[10px] uppercase tracking-[0.16em]">Foto pendiente</span>
    </div>
  );
}
