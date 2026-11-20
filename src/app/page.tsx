import { Hero, type HeroRacket } from "@/sections/home/Hero";
import { Philosophy } from "@/sections/home/Philosophy";
import { Featured } from "@/sections/home/Featured";
import { FinderTeaser } from "@/sections/home/FinderTeaser";
import { Technology } from "@/sections/home/Technology";
import { FinalCta } from "@/sections/home/FinalCta";
import { getAllRackets } from "@/lib/catalog";
import { brandList, brands } from "@/data/brands";
import { mainPhoto } from "@/lib/media";

/** Up to four rackets that have a real photo, featured ones first. */
function heroLineup(): HeroRacket[] {
  const all = getAllRackets();
  const ordered = [...all.filter((r) => r.featured), ...all.filter((r) => !r.featured)];
  return ordered
    .map((r) => ({ r, src: mainPhoto(r) }))
    .filter((x): x is { r: (typeof all)[number]; src: string } => x.src != null)
    .slice(0, 4)
    .map(({ r, src }) => ({ slug: r.slug, src, brand: brands[r.brand].name, model: r.model }));
}

export default function HomePage() {
  return (
    <>
      <Hero rackets={heroLineup()} />
      <Philosophy models={getAllRackets().length} brandCount={brandList.length} />
      <Featured />
      <FinderTeaser />
      <Technology />
      <FinalCta />
    </>
  );
}
