/**
 * Domain model for the RACKET LAB catalogue.
 *
 * Every technical value is either a verified number or `null`. `null` means
 * "not verified yet" and is rendered as "Pendiente" in the UI; the
 * recommendation engine skips factors that depend on missing data and lowers
 * the confidence of the result instead of guessing.
 */

export type BrandId =
  | "wilson"
  | "babolat"
  | "head"
  | "yonex"
  | "tecnifibre"
  | "dunlop"
  | "prince";

export type PlayerLevel = "beginner" | "intermediate" | "advanced" | "competition";

export type PlayStyle =
  | "baseline-aggressive"
  | "defensive"
  | "all-court"
  | "serve-volley"
  | "counterpuncher"
  | "control";

/** Editorial category used for browsing. Derived from specs, not marketing. */
export type RacketType = "power" | "spin" | "control" | "all-round" | "comfort";

export type Availability = "in-stock" | "pre-order" | "out-of-stock" | "pending";

export interface StringPattern {
  mains: number;
  crosses: number;
}

export interface RacketSpecs {
  /** Unstrung weight in grams (manufacturer nominal, usually ±5–7 g). */
  weightUnstrungG: number | null;
  /** Head size in square inches. */
  headSizeSqIn: number | null;
  /** Unstrung balance in millimetres from the butt cap. */
  balanceUnstrungMm: number | null;
  pattern: StringPattern | null;
  /** Stiffness in RA (strung, retailer-measured; sources may differ ±3). */
  stiffnessRA: number | null;
  /** Strung swingweight in kg·cm² (retailer-measured; varies by sample). */
  swingweight: number | null;
  /** Length in inches. */
  lengthIn: number | null;
  /** Beam width in mm, as published (e.g. "23 / 26 / 23"). */
  beamMm: string | null;
  /** Manufacturer recommended tension range in kg, if published. */
  tensionRangeKg: [number, number] | null;
}

export interface PriceInfo {
  /** Selling price in EUR, or null while it is pending confirmation. */
  amount: number | null;
  /** Optional reference price (manufacturer/retailer RRP) in EUR. */
  compareAt: number | null;
  /** Where the price comes from, shown to the merchant in data files. */
  note: string;
}

export interface Colorway {
  /** Main frame colour. */
  frame: string;
  /** Secondary accent (throat, logo band). */
  accent: string;
  /** Grip / handle colour. */
  grip: string;
  /** String colour. */
  strings: string;
}

export interface SpecSource {
  label: string;
  url: string;
}

export interface Racket {
  id: string;
  slug: string;
  brand: BrandId;
  family: string;
  model: string;
  variant: string;
  /** Model year / generation as published. */
  generation: string;
  price: PriceInfo;
  specs: RacketSpecs;
  /** Hero image path. `null` → the procedural studio illustration is used. */
  image: string | null;
  gallery: string[];
  colorway: Colorway;
  /** Editorial classification derived from the specs above. */
  type: RacketType;
  levels: PlayerLevel[];
  styles: PlayStyle[];
  description: string;
  technologies: string[];
  availability: Availability;
  /** External product URL (manufacturer page). */
  purchaseUrl: string | null;
  /** Free-text notes on discrepancies between sources. */
  dataNotes: string[];
  sources: SpecSource[];
  /** ISO date when the specs were last checked. */
  verifiedAt: string;
  featured?: boolean;
}

export interface Brand {
  id: BrandId;
  name: string;
  country: string;
  website: string;
}
