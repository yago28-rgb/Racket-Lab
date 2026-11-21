import type { FactorWeights } from "./types";

/**
 * Relative importance of each factor. Tune here; the UI and the rest of the
 * engine do not need to change. Factors that do not apply to a given player
 * (e.g. "pattern" when no spin/control preference was given) are excluded from
 * the weighted average rather than scored neutrally.
 */
export const defaultWeights: FactorWeights = {
  weight: 1.2,
  level: 1.0,
  style: 1.0,
  powerControl: 1.0,
  feel: 1.1,
  headSize: 0.9,
  comfort: 0.8,
  balance: 0.6,
  pattern: 0.5,
  surface: 0.25,
};

/** Below this share of evaluable weight, a result is flagged as having insufficient data. */
export const CONFIDENCE_THRESHOLD = 0.85;

/** A candidate within this many score points of the best can be an "alternative". */
export const ALTERNATIVE_WINDOW = 0.12;
