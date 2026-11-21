import { Hero } from "@/sections/home/Hero";
import { Statement } from "@/sections/home/Statement";
import { Showcase } from "@/sections/home/Showcase";
import { GrassCourt } from "@/sections/home/GrassCourt";
import { FinderTeaser } from "@/sections/home/FinderTeaser";
import { Technology } from "@/sections/home/Technology";
import { getAllRackets } from "@/lib/catalog";
import { brandList } from "@/data/brands";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement models={getAllRackets().length} brands={brandList.length} />
      <Showcase />
      <GrassCourt />
      <Technology />
      <FinderTeaser />
    </>
  );
}
