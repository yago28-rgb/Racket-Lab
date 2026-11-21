import type { Racket } from "@/types/product";
import type { RacketProfile } from "./types";

/**
 * Converts published specs into playability indices.
 *
 * The model is a transparent heuristic based on widely accepted racket physics:
 * - Power rises with head size, frame stiffness, beam width and swingweight.
 * - Control rises with denser string patterns, smaller heads, thinner/softer frames.
 * - Spin potential rises with open patterns and larger heads.
 * - Comfort rises with lower stiffness and higher mass.
 * - Stability rises with swingweight and static weight.
 * - Manoeuvrability is the inverse of swingweight and head-heaviness.
 *
 * Raw indices are min–max normalised across the current catalogue, so 1.0
 * means "highest in this catalogue", not an absolute value.
 */

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const norm = (v: number, lo: number, hi: number) => clamp((v - lo) / (hi - lo));

export function maxBeam(beam: string | null): number | null {
  if (!beam) return null;
  const nums = beam.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  return nums.length ? Math.max(...nums) : null;
}

interface Term {
  value: number | null;
  weight: number;
}

/** Weighted mean over available terms. Returns coverage = share of weight present. */
function blend(terms: Term[]): { value: number; coverage: number } {
  let sum = 0;
  let w = 0;
  let total = 0;
  for (const t of terms) {
    total += t.weight;
    if (t.value == null) continue;
    sum += t.value * t.weight;
    w += t.weight;
  }
  return { value: w ? sum / w : 0.5, coverage: total ? w / total : 0 };
}

export interface RawProfile {
  values: RacketProfile;
  coverage: Record<keyof RacketProfile, number>;
}

export function rawProfile(r: Racket): RawProfile {
  const s = r.specs;
  const h = s.headSizeSqIn == null ? null : norm(s.headSizeSqIn, 95, 107);
  const ra = s.stiffnessRA == null ? null : norm(s.stiffnessRA, 55, 72);
  const beam = maxBeam(s.beamMm);
  const b = beam == null ? null : norm(beam, 20, 27);
  const w = s.weightUnstrungG == null ? null : norm(s.weightUnstrungG, 265, 320);
  const sw = s.swingweight == null ? null : norm(s.swingweight, 300, 335);
  const bal = s.balanceUnstrungMm == null ? null : norm(s.balanceUnstrungMm, 305, 335);
  const d = s.pattern == null ? null : norm(s.pattern.mains * s.pattern.crosses, 288, 360);
  const inv = (v: number | null) => (v == null ? null : 1 - v);

  const parts = {
    power: blend([
      { value: h, weight: 0.3 },
      { value: ra, weight: 0.3 },
      { value: b, weight: 0.25 },
      { value: sw, weight: 0.15 },
    ]),
    control: blend([
      { value: inv(h), weight: 0.3 },
      { value: d, weight: 0.25 },
      { value: inv(b), weight: 0.25 },
      { value: inv(ra), weight: 0.2 },
    ]),
    spin: blend([
      { value: inv(d), weight: 0.55 },
      { value: h, weight: 0.3 },
      { value: b, weight: 0.15 },
    ]),
    comfort: blend([
      { value: inv(ra), weight: 0.6 },
      { value: w, weight: 0.2 },
      { value: inv(b), weight: 0.2 },
    ]),
    stability: blend([
      { value: sw, weight: 0.55 },
      { value: w, weight: 0.35 },
      { value: bal, weight: 0.1 },
    ]),
    maneuverability: blend([
      { value: inv(sw), weight: 0.6 },
      { value: inv(w), weight: 0.2 },
      { value: inv(bal), weight: 0.2 },
    ]),
    classic: blend([
      { value: inv(b), weight: 0.4 },
      { value: inv(ra), weight: 0.3 },
      { value: inv(h), weight: 0.15 },
      { value: d, weight: 0.15 },
    ]),
  };

  const values = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v.value])) as unknown as RacketProfile;
  const coverage = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v.coverage])) as unknown as Record<
    keyof RacketProfile,
    number
  >;
  return { values, coverage };
}

/** Normalises every index across the given catalogue (0 = lowest, 1 = highest). */
export function catalogueProfiles(rackets: Racket[]): Map<string, RawProfile> {
  const raws = rackets.map((r) => [r.id, rawProfile(r)] as const);
  const keys = Object.keys(raws[0]?.[1].values ?? {}) as (keyof RacketProfile)[];
  const ranges = Object.fromEntries(
    keys.map((k) => {
      const vals = raws.map(([, p]) => p.values[k]);
      return [k, [Math.min(...vals), Math.max(...vals)]];
    }),
  ) as Record<keyof RacketProfile, [number, number]>;

  const out = new Map<string, RawProfile>();
  for (const [id, p] of raws) {
    const values = { ...p.values };
    for (const k of keys) {
      const [lo, hi] = ranges[k];
      values[k] = hi - lo < 1e-9 ? 0.5 : (p.values[k] - lo) / (hi - lo);
    }
    out.set(id, { values, coverage: p.coverage });
  }
  return out;
}
