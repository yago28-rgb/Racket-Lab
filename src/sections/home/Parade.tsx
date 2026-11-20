import Image from "next/image";
import Link from "next/link";
import { getAllRackets } from "@/lib/catalog";
import { brandList, brands } from "@/data/brands";
import { mainPhoto } from "@/lib/media";
import { VelocityMarquee } from "@/components/ui/motion-kit";

/** Two marquees: the real racket photos, and the brand line — both react to scroll velocity. */
export function Parade() {
  const withPhoto = getAllRackets()
    .map((r) => ({ r, src: mainPhoto(r) }))
    .filter((x): x is { r: (typeof x)["r"]; src: string } => x.src != null);

  return (
    <section aria-label="Raquetas y marcas" className="border-y border-line bg-white py-10 md:py-14">
      {withPhoto.length > 0 && (
        <VelocityMarquee baseSpeed={34}>
          {withPhoto.map(({ r, src }) => (
            <Link
              key={r.id}
              href={`/raquetas/${r.slug}`}
              className="group relative mx-2 block h-56 w-36 shrink-0 overflow-hidden rounded-2xl bg-mist transition-colors hover:bg-cloud md:mx-3 md:h-72 md:w-44"
            >
              <Image
                src={src}
                alt={`${brands[r.brand].name} ${r.model}`}
                fill
                sizes="176px"
                className="object-contain p-3 mix-blend-multiply transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-3 group-hover:scale-105"
              />
              <span className="absolute inset-x-3 bottom-3 truncate text-[11px] font-medium text-ink/60">
                {brands[r.brand].name} {r.model}
              </span>
            </Link>
          ))}
        </VelocityMarquee>
      )}
      <VelocityMarquee baseSpeed={-28} className={withPhoto.length > 0 ? "mt-8 md:mt-10" : ""}>
        {brandList.map((b) => (
          <Link
            key={b.id}
            href={`/raquetas?brand=${b.id}`}
            className="mx-6 text-[clamp(2.2rem,5vw,4rem)] font-semibold tracking-tight text-ink/15 transition-colors hover:text-ink md:mx-10"
          >
            {b.name}
          </Link>
        ))}
      </VelocityMarquee>
    </section>
  );
}
