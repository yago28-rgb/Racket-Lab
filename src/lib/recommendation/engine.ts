import type { PlayerLevel, PlayStyle, Racket } from "@/types/product";
import { balancePoints, racketName } from "@/lib/format";
import { catalogueProfiles, type RawProfile } from "./profile";
import { ALTERNATIVE_WINDOW, CONFIDENCE_THRESHOLD, defaultWeights } from "./weights";
import type {
  FactorId,
  FactorResult,
  FactorWeights,
  FeelPref,
  FinderAnswers,
  HeadPref,
  Recommendation,
  RacketProfile,
  ScoredRacket,
  WeightPref,
} from "./types";

/**
 * RACKET FINDER — weighted compatibility model.
 *
 * Pipeline:
 *  1. Hard-filter frames that are clearly incompatible (with automatic relaxation
 *     if fewer than three remain).
 *  2. Score every applicable factor 0..1 against the racket's verified specs.
 *  3. Weighted mean over the factors that could be evaluated → compatibility %.
 *  4. Rank, pick best match + budget and performance alternatives.
 *  5. Generate explanations from the factor scores (no canned copy).
 *
 * Pure functions only: no React, no I/O. Covered by `npm run test:engine`.
 */

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/**
 * Soft plateau: ≈1 inside [lo, hi] (peaking at the centre, 0.9 at the edges so
 * that closer matches rank higher), falling linearly to 0 at `falloff` outside.
 */
function plateau(v: number, lo: number, hi: number, falloff: number) {
  if (v >= lo && v <= hi) {
    const half = (hi - lo) / 2 || 1;
    return 1 - 0.1 * (Math.abs(v - (lo + hi) / 2) / half);
  }
  const dist = v < lo ? lo - v : v - hi;
  return clamp(1 - dist / falloff);
}

const LEVEL_ORDER: PlayerLevel[] = ["beginner", "intermediate", "advanced", "competition"];

// ───────────────────────── Targets derived from answers ─────────────────────────

export function targetWeightRange(a: FinderAnswers): { range: [number, number]; explicit: boolean } {
  const explicit: Record<Exclude<WeightPref, "auto">, [number, number]> = {
    lt270: [250, 269],
    "270-285": [270, 285],
    "285-300": [285, 300],
    "300-315": [300, 315],
    gt315: [316, 340],
  };
  if (a.weight && a.weight !== "auto") return { range: explicit[a.weight], explicit: true };

  const byLevel: Record<PlayerLevel, [number, number]> = {
    beginner: [265, 290],
    intermediate: [285, 305],
    advanced: [295, 315],
    competition: [300, 325],
  };
  let [lo, hi] = byLevel[a.level ?? "intermediate"];
  if (a.armIssues || (a.age != null && a.age >= 60)) {
    lo -= 10;
    hi -= 5;
  }
  if (a.frequency === "competition" && a.level !== "beginner") hi += 5;
  return { range: [lo, hi], explicit: false };
}

export function targetHeadRange(a: FinderAnswers): { range: [number, number]; explicit: boolean } {
  const explicit: Record<Exclude<HeadPref, "unknown">, [number, number]> = {
    "85-97": [85, 97],
    "98-100": [98, 100],
    "101-105": [101, 105],
    gt105: [106, 120],
  };
  if (a.head && a.head !== "unknown") return { range: explicit[a.head], explicit: true };
  const byLevel: Record<PlayerLevel, [number, number]> = {
    beginner: [100, 110],
    intermediate: [98, 105],
    advanced: [97, 100],
    competition: [95, 100],
  };
  return { range: byLevel[a.level ?? "intermediate"], explicit: false };
}

/** Preferred head-light points by style. */
const balanceTarget: Record<PlayStyle, [number, number]> = {
  "serve-volley": [7, 11],
  "all-court": [5, 9],
  control: [6, 10],
  "baseline-aggressive": [4, 8],
  defensive: [4, 8],
  counterpuncher: [5, 8],
};

/** What each style asks of a frame, on the catalogue-relative 0..1 scale. */
const styleTargets: Record<PlayStyle, Partial<RacketProfile>> = {
  "baseline-aggressive": { spin: 0.7, power: 0.6, stability: 0.6 },
  defensive: { spin: 0.6, maneuverability: 0.6, comfort: 0.55, power: 0.55 },
  "all-court": { maneuverability: 0.6, control: 0.55, stability: 0.5 },
  "serve-volley": { maneuverability: 0.75, stability: 0.6, control: 0.6 },
  counterpuncher: { spin: 0.65, maneuverability: 0.65, control: 0.5 },
  control: { control: 0.8, classic: 0.6, power: 0.3 },
};

const feelToIndex: Record<FeelPref, keyof RacketProfile> = {
  spin: "spin",
  power: "power",
  control: "control",
  comfort: "comfort",
  stability: "stability",
  classic: "classic",
};

const feelLabel: Record<FeelPref, string> = {
  spin: "efecto",
  power: "potencia y profundidad",
  control: "control y precisión",
  comfort: "comodidad",
  stability: "estabilidad",
  classic: "sensación clásica",
};

function needsComfort(a: FinderAnswers): string | null {
  if (a.armIssues) return "has indicado molestias en el brazo";
  if (a.feel.includes("comfort")) return "buscas comodidad";
  if (a.age != null && a.age >= 60) return "has indicado una edad de 60 años o más";
  if (a.stringType === "poly" && (a.frequency === "4-5" || a.frequency === "competition"))
    return "juegas con frecuencia con cuerda de poliéster";
  return null;
}

// ───────────────────────── Factor scoring ─────────────────────────

interface Ctx {
  a: FinderAnswers;
  p: RawProfile;
  w: FactorWeights;
}

const PROFILE_MIN_COVERAGE = 0.6;
function idx(ctx: Ctx, k: keyof RacketProfile): number | null {
  return ctx.p.coverage[k] >= PROFILE_MIN_COVERAGE ? ctx.p.values[k] : null;
}

function scoreFactors(r: Racket, ctx: Ctx): FactorResult[] {
  const { a, w } = ctx;
  const s = r.specs;
  const out: FactorResult[] = [];
  const push = (id: FactorId, label: string, score: number | null, detail: string) =>
    out.push({ id, label, score: score == null ? null : clamp(score), weight: w[id], detail });

  // 1. Weight
  {
    const { range } = targetWeightRange(a);
    const v = s.weightUnstrungG;
    push(
      "weight",
      "Peso",
      v == null ? null : plateau(v, range[0], range[1], 20),
      v == null
        ? "Peso sin encordar no verificado."
        : `${v} g sin encordar frente a tu rango objetivo de ${range[0]}–${range[1]} g.`,
    );
  }

  // 2. Balance (only if we know the style)
  if (a.style) {
    const [lo, hi] = balanceTarget[a.style];
    const mm = s.balanceUnstrungMm;
    const pts = mm == null ? null : balancePoints(mm, s.lengthIn ?? 27);
    push(
      "balance",
      "Balance",
      pts == null ? null : plateau(pts, lo, hi, 4),
      pts == null
        ? "Balance no verificado."
        : `${pts} pts hacia el puño; para tu estilo funciona bien entre ${lo} y ${hi} pts.`,
    );
  }

  // 3. Style
  if (a.style) {
    const t = styleTargets[a.style];
    const keys = Object.keys(t) as (keyof RacketProfile)[];
    const sims = keys.map((k) => {
      const v = idx(ctx, k);
      return v == null ? null : 1 - Math.abs(v - (t[k] as number));
    });
    const valid = sims.filter((x): x is number => x != null);
    const profileSim = valid.length ? valid.reduce((x, y) => x + y, 0) / valid.length : null;
    const editorial = r.styles.includes(a.style) ? 1 : 0.35;
    push(
      "style",
      "Estilo de juego",
      profileSim == null ? editorial : 0.5 * editorial + 0.5 * profileSim,
      r.styles.includes(a.style)
        ? "Su perfil de especificaciones encaja con tu forma de jugar."
        : "No es un marco pensado principalmente para tu estilo.",
    );
  }

  // 4. Power ↔ control
  {
    const pw = idx(ctx, "power");
    const ct = idx(ctx, "control");
    const target = a.powerControl / 100;
    const rel = pw == null || ct == null ? null : (ct - pw + 1) / 2;
    push(
      "powerControl",
      "Potencia / control",
      rel == null ? null : 1 - Math.abs(rel - target) * 1.4,
      rel == null
        ? "Faltan datos para situar el marco en el eje potencia/control."
        : `Se sitúa en ${Math.round(rel * 100)}/100 en el eje potencia→control del catálogo; tú buscas ${a.powerControl}/100.`,
    );
  }

  // 5. Head size
  {
    const { range } = targetHeadRange(a);
    const v = s.headSizeSqIn;
    push(
      "headSize",
      "Tamaño de cabeza",
      v == null ? null : plateau(v, range[0], range[1], 6),
      v == null ? "Tamaño de cabeza no verificado." : `${v} in² frente a ${range[0]}–${range[1]} in² recomendados para ti.`,
    );
  }

  // 6. String pattern (only with a spin or precision preference)
  const wantsSpin = a.feel.includes("spin");
  const wantsDense = a.feel.includes("control") || a.feel.includes("classic") || a.style === "control";
  if (wantsSpin !== wantsDense) {
    const p = s.pattern;
    const d = p == null ? null : clamp((p.mains * p.crosses - 288) / 72);
    push(
      "pattern",
      "Patrón de encordado",
      d == null ? null : wantsSpin ? 1 - d * 0.8 : 0.2 + d * 0.8,
      p == null
        ? "Patrón no verificado."
        : wantsSpin
          ? `Patrón ${p.mains}×${p.crosses}: ${p.mains * p.crosses <= 304 ? "abierto, favorece el efecto" : "denso, limita algo el efecto"}.`
          : `Patrón ${p.mains}×${p.crosses}: ${p.mains * p.crosses >= 320 ? "denso, favorece la precisión" : "abierto, algo menos predecible"}.`,
    );
  }

  // 7. Level
  if (a.level) {
    const li = LEVEL_ORDER.indexOf(a.level);
    const dist = Math.min(...r.levels.map((l) => Math.abs(LEVEL_ORDER.indexOf(l) - li)));
    push(
      "level",
      "Nivel",
      dist === 0 ? 1 : dist === 1 ? 0.55 : 0.15,
      dist === 0 ? "Indicada para tu nivel de juego." : "Pensada para un nivel distinto al tuyo.",
    );
  }

  // 8. Comfort
  const comfortReason = needsComfort(a);
  if (comfortReason) {
    const c = idx(ctx, "comfort");
    push(
      "comfort",
      "Comodidad",
      c,
      s.stiffnessRA == null
        ? "Rigidez no verificada."
        : `Rigidez de ${s.stiffnessRA} RA; relevante porque ${comfortReason}.`,
    );
  }

  // 9. Feel preferences
  if (a.feel.length) {
    const vals = a.feel.map((f) => idx(ctx, feelToIndex[f]));
    const valid = vals.filter((x): x is number => x != null);
    push(
      "feel",
      "Sensaciones",
      valid.length === vals.length ? valid.reduce((x, y) => x + y, 0) / valid.length : null,
      `Valoración relativa al catálogo en ${a.feel.map((f) => feelLabel[f]).join(", ")}.`,
    );
  }

  // 10. Surface (low influence by design)
  if (a.surface === "clay" || a.surface === "grass") {
    const v = a.surface === "clay" ? idx(ctx, "spin") : idx(ctx, "maneuverability");
    push(
      "surface",
      "Superficie",
      v,
      a.surface === "clay"
        ? "En tierra batida el efecto ayuda a construir el punto (influencia baja en el cálculo)."
        : "En hierba la bola bota bajo y rápido: se valora la manejabilidad (influencia baja).",
    );
  }

  return out;
}

// ───────────────────────── Explanations ─────────────────────────

function explain(r: Racket, factors: FactorResult[], profile: RacketProfile) {
  const strengths: string[] = [];
  const drawbacks: string[] = [];
  for (const f of factors) {
    if (f.score == null) continue;
    if (f.score >= 0.8) strengths.push(f.detail);
    else if (f.score <= 0.45) drawbacks.push(f.detail);
  }
  // Add one profile-based observation if nothing else stands out.
  if (strengths.length === 0) {
    const best = (Object.entries(profile) as [keyof RacketProfile, number][]).sort((a, b) => b[1] - a[1])[0];
    const names: Record<keyof RacketProfile, string> = {
      power: "potencia",
      control: "control",
      spin: "efecto",
      comfort: "comodidad",
      stability: "estabilidad",
      maneuverability: "manejabilidad",
      classic: "sensación clásica",
    };
    strengths.push(`Su punto más fuerte dentro del catálogo es la ${names[best[0]]}.`);
  }
  if (r.dataNotes.length && drawbacks.length < 3) {
    drawbacks.push("Algunas mediciones difieren entre fuentes; revisa la ficha técnica.");
  }
  return { strengths: strengths.slice(0, 4), drawbacks: drawbacks.slice(0, 3) };
}

// ───────────────────────── Hard filters ─────────────────────────

function hardExclude(r: Racket, a: FinderAnswers): boolean {
  const w = r.specs.weightUnstrungG;
  const h = r.specs.headSizeSqIn;
  if (a.level === "beginner" && ((w != null && w >= 310) || (h != null && h < 98))) return true;
  const wr = targetWeightRange(a);
  if (wr.explicit && w != null && (w < wr.range[0] - 20 || w > wr.range[1] + 20)) return true;
  const hr = targetHeadRange(a);
  if (hr.explicit && h != null && (h < hr.range[0] - 5 || h > hr.range[1] + 5)) return true;
  return false;
}

// ───────────────────────── Public API ─────────────────────────

export function scoreRacket(r: Racket, a: FinderAnswers, p: RawProfile, w: FactorWeights = defaultWeights): ScoredRacket {
  const factors = scoreFactors(r, { a, p, w });
  const applicable = factors.reduce((s, f) => s + f.weight, 0);
  const evaluated = factors.filter((f) => f.score != null);
  const evalWeight = evaluated.reduce((s, f) => s + f.weight, 0);
  const raw = evalWeight ? evaluated.reduce((s, f) => s + (f.score as number) * f.weight, 0) / evalWeight : 0;
  const confidence = applicable ? evalWeight / applicable : 0;
  // Missing data slightly lowers the score so that complete data wins ties.
  const compatibility = Math.round(raw * (0.9 + 0.1 * confidence) * 100);
  const { strengths, drawbacks } = explain(r, factors, p.values);
  return {
    racket: r,
    compatibility,
    confidence,
    insufficientData: confidence < CONFIDENCE_THRESHOLD,
    factors,
    strengths,
    drawbacks,
    profile: p.values,
  };
}

export function recommend(
  catalogue: Racket[],
  answers: FinderAnswers,
  weights: FactorWeights = defaultWeights,
): Recommendation {
  const notes: string[] = [];
  const profiles = catalogueProfiles(catalogue);

  let pool = catalogue.filter((r) => !hardExclude(r, answers));
  let excludedCount = catalogue.length - pool.length;
  if (pool.length < 3) {
    notes.push(
      "Con tus preferencias de peso o cabeza quedaban menos de tres raquetas compatibles; se muestran todas ordenadas por compatibilidad.",
    );
    pool = catalogue;
    excludedCount = 0;
  }

  const ranked = pool
    .map((r) => scoreRacket(r, answers, profiles.get(r.id)!, weights))
    .sort((x, y) => y.compatibility - x.compatibility || y.confidence - x.confidence);

  const best = ranked[0] ?? null;
  const window = best ? best.compatibility - ALTERNATIVE_WINDOW * 100 : 0;
  const near = ranked.slice(1).filter((s) => s.compatibility >= window);

  // Budget alternative: cheapest priced option close to the best match.
  // Only claimed when both prices are confirmed: we never compare against a pending price.
  let budgetAlternative: ScoredRacket | null = null;
  let budgetNote: string | null = null;
  if (best?.racket.price.amount != null) {
    budgetAlternative =
      near
        .filter((s) => s.racket.price.amount != null && s.racket.price.amount < (best.racket.price.amount as number))
        .sort((x, y) => (x.racket.price.amount as number) - (y.racket.price.amount as number))[0] ?? null;
    if (!budgetAlternative) budgetNote = "No hay una alternativa compatible más económica con precio confirmado.";
  } else if (best) {
    budgetNote =
      "El precio de tu mejor opción está pendiente de confirmar, así que no podemos señalar una alternativa más económica con rigor.";
  }

  // Performance alternative: more stability/mass than the best, still compatible.
  const performanceAlternative =
    best == null
      ? null
      : (near
          .filter((s) => s.racket.id !== budgetAlternative?.racket.id)
          .filter((s) => s.profile.stability > best.profile.stability + 0.05)
          .sort((x, y) => y.profile.stability - x.profile.stability)[0] ?? null);

  const topThree = ranked.slice(0, 3);
  if (best?.insufficientData) {
    notes.push(`Parte de los datos técnicos de ${racketName(best.racket)} están pendientes de verificar; el resultado es menos fiable.`);
  }

  return { ranked, best, topThree, budgetAlternative, budgetNote, performanceAlternative, excludedCount, notes };
}
