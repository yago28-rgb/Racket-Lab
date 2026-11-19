import Image from "next/image";
import type { Racket } from "@/types/product";
import { cn, fullRacketName } from "@/lib/format";
import { productStill, type RenderView } from "@/lib/media";

/**
 * Licensed photography when available; otherwise the Blender render generated
 * from the racket's real specs. Renders are always labelled as representative.
 */
export function ProductMedia({
  racket,
  className,
  view = "hero",
  priority,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  label = true,
}: {
  racket: Racket;
  className?: string;
  view?: RenderView;
  priority?: boolean;
  sizes?: string;
  label?: boolean;
}) {
  const still = productStill(racket, view);
  const alt =
    still.kind === "photo"
      ? fullRacketName(racket)
      : `Render 3D representativo de la ${fullRacketName(racket)} (no es una fotografía del producto)`;
  return (
    <>
      <Image src={still.src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-contain", className)} />
      {label && still.kind === "render" && (
        <span className="pointer-events-none absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.14em] text-muted">Render 3D representativo</span>
      )}
    </>
  );
}
