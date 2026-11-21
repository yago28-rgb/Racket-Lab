import { getAllRackets, getFeaturedRackets } from "@/lib/catalog";
import { FeaturedRail } from "./FeaturedRail";

export function Featured() {
  const featured = getFeaturedRackets();
  return <FeaturedRail rackets={featured} more={getAllRackets().length - featured.length} />;
}
