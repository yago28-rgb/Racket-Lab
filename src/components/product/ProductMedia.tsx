import Image from "next/image";
import type { Racket } from "@/types/product";
import { RacketArt } from "./RacketArt";
import { cn, fullRacketName } from "@/lib/format";

/** Shows licensed photography when available, otherwise the labelled studio illustration. */
export function ProductMedia({
  racket,
  className,
  angle,
  uid,
  priority,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: {
  racket: Racket;
  className?: string;
  angle?: number;
  uid?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (racket.image) {
    return (
      <Image
        src={racket.image}
        alt={fullRacketName(racket)}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-contain", className)}
      />
    );
  }
  return <RacketArt racket={racket} angle={angle} uid={uid} className={cn("h-full w-full", className)} />;
}
