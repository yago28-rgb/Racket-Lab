import { Hero } from "@/sections/home/Hero";
import { Philosophy } from "@/sections/home/Philosophy";
import { Featured } from "@/sections/home/Featured";
import { FinderTeaser } from "@/sections/home/FinderTeaser";
import { Technology } from "@/sections/home/Technology";
import { FinalCta } from "@/sections/home/FinalCta";
import { getAllRackets } from "@/lib/catalog";
import { brandList } from "@/data/brands";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Philosophy models={getAllRackets().length} brandCount={brandList.length} />
      <Featured />
      <FinderTeaser />
      <Technology />
      <FinalCta />
    </>
  );
}
