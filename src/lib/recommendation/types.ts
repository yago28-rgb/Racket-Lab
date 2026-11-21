import type { PlayerLevel, PlayStyle, Racket } from "@/types/product";

export type WeightPref = "lt270" | "270-285" | "285-300" | "300-315" | "gt315" | "auto";
export type HeadPref = "85-97" | "98-100" | "101-105" | "gt105" | "unknown";
export type FeelPref = "spin" | "power" | "control" | "comfort" | "stability" | "classic";
export type StringType = "poly" | "multi" | "gut" | "hybrid" | "none";
export type TensionPref = "lt21" | "21-23" | "23-25" | "gt25" | "unknown";
export type GripSize = "L1" | "L2" | "L3" | "L4" | "L5" | "unknown";
export type Surface = "clay" | "hard" | "grass" | "indoor" | "mixed";
export type Frequency = "1" | "2-3" | "4-5" | "competition";

export interface FinderAnswers {
  level: PlayerLevel | null;
  style: PlayStyle | null;
  weight: WeightPref | null;
  /** 0 = maximum power, 100 = maximum control. */
  powerControl: number;
  feel: FeelPref[];
  head: HeadPref | null;
  stringType: StringType | null;
  tension: TensionPref | null;
  grip: GripSize | null;
  surface: Surface | null;
  frequency: Frequency | null;
  /** Optional, never required. */
  age: number | null;
  /** Optional: user reports elbow/arm discomfort. */
  armIssues: boolean;
}

export const emptyAnswers: FinderAnswers = {
  level: null,
  style: null,
  weight: null,
  powerControl: 50,
  feel: [],
  head: null,
  stringType: null,
  tension: null,
  grip: null,
  surface: null,
  frequency: null,
  age: null,
  armIssues: false,
};

export type FactorId =
  | "weight"
  | "balance"
  | "style"
  | "powerControl"
  | "headSize"
  | "pattern"
  | "level"
  | "comfort"
  | "feel"
  | "surface";

export type FactorWeights = Record<FactorId, number>;

export interface FactorResult {
  id: FactorId;
  label: string;
  /** 0..1, or null if the factor could not be evaluated (missing specs). */
  score: number | null;
  weight: number;
  /** Human explanation with the concrete numbers involved. */
  detail: string;
}

export interface RacketProfile {
  power: number;
  control: number;
  spin: number;
  comfort: number;
  stability: number;
  maneuverability: number;
  classic: number;
}

export interface ScoredRacket {
  racket: Racket;
  /** 0..100, computed by the weighted model. */
  compatibility: number;
  /** Share of applicable factor weight that could be evaluated (0..1). */
  confidence: number;
  insufficientData: boolean;
  factors: FactorResult[];
  strengths: string[];
  drawbacks: string[];
  profile: RacketProfile;
}

export interface Recommendation {
  ranked: ScoredRacket[];
  best: ScoredRacket | null;
  topThree: ScoredRacket[];
  budgetAlternative: ScoredRacket | null;
  budgetNote: string | null;
  performanceAlternative: ScoredRacket | null;
  excludedCount: number;
  notes: string[];
}
