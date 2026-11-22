import { products } from "@/data/products";
import { brands } from "@/data/brands";
import type { BrandId, PlayerLevel, PlayStyle, Racket, RacketType } from "@/types/product";

/** Catalogue access layer. Swap these functions for DB queries (e.g. Supabase) without touching the UI. */

export function getAllRackets(): Racket[] {
  return products;
}

export function getRacketBySlug(slug: string): Racket | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRacketById(id: string): Racket | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedRackets(): Racket[] {
  return products.filter((p) => p.featured);
}

export function isPurchasable(r: Racket): boolean {
  return r.price.amount != null && (r.availability === "in-stock" || r.availability === "pre-order");
}

/** Related rackets: same type or overlapping styles, closest in weight & head size. */
export function getRelatedRackets(r: Racket, limit = 3): Racket[] {
  return products
    .filter((p) => p.id !== r.id)
    .map((p) => {
      let score = 0;
      if (p.type === r.type) score += 3;
      score += p.styles.filter((s) => r.styles.includes(s)).length;
      const dw = Math.abs((p.specs.weightUnstrungG ?? 0) - (r.specs.weightUnstrungG ?? 0));
      const dh = Math.abs((p.specs.headSizeSqIn ?? 0) - (r.specs.headSizeSqIn ?? 0));
      score -= dw / 10 + dh / 3;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

// ───────────────────────────── Filters ─────────────────────────────

export type WeightBucket = "lt285" | "285-299" | "300-309" | "gte310";
export type HeadBucket = "lte98" | "99-100" | "gt100";
export type BalanceBucket = "head-light" | "even" ;
export type PriceBucket = "priced" | "lt250" | "250-300" | "gt300";
export type SortKey = "featured" | "price-asc" | "price-desc" | "weight-asc" | "weight-desc" | "name";

export interface CatalogFilters {
  q: string;
  brands: BrandId[];
  levels: PlayerLevel[];
  styles: PlayStyle[];
  types: RacketType[];
  weight: WeightBucket[];
  head: HeadBucket[];
  balance: BalanceBucket[];
  price: PriceBucket[];
  sort: SortKey;
}

export const emptyFilters: CatalogFilters = {
  q: "",
  brands: [],
  levels: [],
  styles: [],
  types: [],
  weight: [],
  head: [],
  balance: [],
  price: [],
  sort: "featured",
};

export const weightBucketLabels: Record<WeightBucket, string> = {
  lt285: "< 285 g",
  "285-299": "285–299 g",
  "300-309": "300–309 g",
  gte310: "≥ 310 g",
};
export const headBucketLabels: Record<HeadBucket, string> = {
  lte98: "≤ 98 in²",
  "99-100": "99–100 in²",
  gt100: "> 100 in²",
};
export const balanceBucketLabels: Record<BalanceBucket, string> = {
  "head-light": "Hacia el puño (≥ 8 pts HL)",
  even: "Más neutro (< 8 pts HL)",
};
export const priceBucketLabels: Record<PriceBucket, string> = {
  priced: "Con precio confirmado",
  lt250: "< 250 €",
  "250-300": "250–300 €",
  gt300: "> 300 €",
};

function inWeight(w: number | null, b: WeightBucket) {
  if (w == null) return false;
  switch (b) {
    case "lt285":
      return w < 285;
    case "285-299":
      return w >= 285 && w < 300;
    case "300-309":
      return w >= 300 && w < 310;
    case "gte310":
      return w >= 310;
  }
}
function inHead(h: number | null, b: HeadBucket) {
  if (h == null) return false;
  if (b === "lte98") return h <= 98;
  if (b === "99-100") return h >= 99 && h <= 100;
  return h > 100;
}
function inBalance(mm: number | null, b: BalanceBucket) {
  if (mm == null) return false;
  // 8 pts HL ≈ 317.5 mm for a 27" frame.
  return b === "head-light" ? mm <= 317.5 : mm > 317.5;
}
function inPrice(p: number | null, b: PriceBucket) {
  if (p == null) return false;
  if (b === "priced") return true;
  if (b === "lt250") return p < 250;
  if (b === "250-300") return p >= 250 && p <= 300;
  return p > 300;
}

const any = <T,>(selected: T[], test: (v: T) => boolean) => selected.length === 0 || selected.some(test);

export function filterRackets(list: Racket[], f: CatalogFilters): Racket[] {
  const q = f.q.trim().toLowerCase();
  const out = list.filter((r) => {
    if (q) {
      const hay = `${brands[r.brand].name} ${r.family} ${r.model} ${r.variant} ${r.generation}`.toLowerCase();
      if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
    }
    if (f.brands.length && !f.brands.includes(r.brand)) return false;
    if (f.types.length && !f.types.includes(r.type)) return false;
    if (f.levels.length && !f.levels.some((l) => r.levels.includes(l))) return false;
    if (f.styles.length && !f.styles.some((s) => r.styles.includes(s))) return false;
    if (!any(f.weight, (b) => inWeight(r.specs.weightUnstrungG, b))) return false;
    if (!any(f.head, (b) => inHead(r.specs.headSizeSqIn, b))) return false;
    if (!any(f.balance, (b) => inBalance(r.specs.balanceUnstrungMm, b))) return false;
    if (!any(f.price, (b) => inPrice(r.price.amount, b))) return false;
    return true;
  });
  return sortRackets(out, f.sort);
}

export function sortRackets(list: Racket[], sort: SortKey): Racket[] {
  const arr = [...list];
  const priceOr = (r: Racket, fallback: number) => r.price.amount ?? fallback;
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => priceOr(a, Infinity) - priceOr(b, Infinity));
    case "price-desc":
      return arr.sort((a, b) => priceOr(b, -Infinity) - priceOr(a, -Infinity));
    case "weight-asc":
      return arr.sort((a, b) => (a.specs.weightUnstrungG ?? 0) - (b.specs.weightUnstrungG ?? 0));
    case "weight-desc":
      return arr.sort((a, b) => (b.specs.weightUnstrungG ?? 0) - (a.specs.weightUnstrungG ?? 0));
    case "name":
      return arr.sort((a, b) => `${a.brand}${a.model}`.localeCompare(`${b.brand}${b.model}`));
    default:
      return arr.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}

/** Real min/max of the catalogue, used as the scale of every spec visual. */
export function getSpecRanges() {
  const range = (vals: (number | null)[]): [number, number] => {
    const v = vals.filter((x): x is number => x != null);
    return [Math.min(...v), Math.max(...v)];
  };
  return {
    weight: range(products.map((p) => p.specs.weightUnstrungG)),
    head: range(products.map((p) => p.specs.headSizeSqIn)),
    stiffness: range(products.map((p) => p.specs.stiffnessRA)),
    swingweight: range(products.map((p) => p.specs.swingweight)),
  };
}
