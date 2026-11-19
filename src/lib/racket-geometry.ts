/**
 * Parametric racket geometry shared by the WebGL model and the SVG illustration.
 *
 * Units: inches, origin at the butt cap, +y towards the tip.
 * The string bed is modelled as an ellipse whose area equals the published head
 * size, so a 97 in² frame really is smaller than a 100 in² one, and the drawn
 * string pattern uses the real mains × crosses count.
 */

export type Pt = [number, number];

export interface RacketDims {
  length: number;
  aIn: number; // inner semi-axis (vertical)
  bIn: number; // inner semi-axis (horizontal)
  aOut: number;
  bOut: number;
  headCY: number;
  handleTop: number;
  handleHalfWidth: number;
  depth: number; // beam, inches
  yokeY: number; // absolute y of the string-bed bottom
  sinCut: number;
}

const ASPECT = 0.76; // width / length of the string bed ellipse
const FACE = 0.48; // frame face width, inches
const SIN_CUT = -0.8; // where the hoop opens into the throat

export function racketDims(headSqIn = 100, beamMm = 23, lengthIn = 27): RacketDims {
  const aIn = Math.sqrt(headSqIn / (Math.PI * ASPECT));
  const bIn = aIn * ASPECT;
  const aOut = aIn + FACE;
  const bOut = bIn + FACE;
  const headCY = lengthIn - aOut;
  return {
    length: lengthIn,
    aIn,
    bIn,
    aOut,
    bOut,
    headCY,
    handleTop: 7.2,
    handleHalfWidth: 0.62,
    depth: beamMm / 25.4,
    yokeY: headCY + SIN_CUT * aIn,
    sinCut: SIN_CUT,
  };
}

/** Thick open hoop (outer arc forward, inner arc backward). */
export function hoopOutline(d: RacketDims, steps = 96): Pt[] {
  const t0 = Math.asin(d.sinCut); // right side, negative
  const t1 = Math.PI - t0; // left side
  const outer: Pt[] = [];
  const inner: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    outer.push([d.bOut * Math.cos(t), d.headCY + d.aOut * Math.sin(t)]);
    inner.push([d.bIn * Math.cos(t), d.headCY + d.aIn * Math.sin(t)]);
  }
  return [...outer, ...inner.reverse()];
}

function quad(p0: Pt, c: Pt, p1: Pt, steps: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]);
  }
  return out;
}

/** Throat (two arms + yoke) as one closed outline. */
export function throatOutline(d: RacketDims, steps = 24): Pt[] {
  const t0 = Math.asin(d.sinCut);
  const xo = d.bOut * Math.cos(t0);
  const yo = d.headCY + d.aOut * Math.sin(t0);
  const xi = d.bIn * Math.cos(t0);
  const yi = d.yokeY;
  const hw = d.handleHalfWidth;
  const yh = d.handleTop;
  const left: Pt = [-xo, yo];
  const pts: Pt[] = [left];
  pts.push(...quad(left, [-hw * 1.15, yh + (yo - yh) * 0.45], [-hw, yh], steps));
  pts.push([hw, yh]);
  pts.push(...quad([hw, yh], [hw * 1.15, yh + (yo - yh) * 0.45], [xo, yo], steps));
  pts.push([xi, yi]);
  pts.push([-xi, yi]);
  return pts;
}

/** Open throat window under the yoke. */
export function throatHole(d: RacketDims, steps = 20): Pt[] {
  const t0 = Math.asin(d.sinCut);
  const xi = d.bIn * Math.cos(t0);
  const top = d.yokeY - 0.42;
  const apex: Pt = [0, d.handleTop + 1.5];
  const l: Pt = [-xi * 0.72, top];
  const r: Pt = [xi * 0.72, top];
  return [l, r, ...quad(r, [xi * 0.25, top - (top - apex[1]) * 0.55], apex, steps), ...quad(apex, [-xi * 0.25, top - (top - apex[1]) * 0.55], l, steps)];
}

export interface StringLine {
  from: Pt;
  to: Pt;
}

/** Real mains × crosses layout clipped to the string bed. */
export function stringLines(d: RacketDims, mains = 16, crosses = 19): { mains: StringLine[]; crosses: StringLine[] } {
  const halfW = d.bIn * 0.94;
  const m: StringLine[] = [];
  for (let k = 0; k < mains; k++) {
    const x = -halfW + ((k + 0.5) * 2 * halfW) / mains;
    const top = d.headCY + d.aIn * Math.sqrt(Math.max(0, 1 - (x / d.bIn) ** 2));
    m.push({ from: [x, d.yokeY], to: [x, top] });
  }
  const c: StringLine[] = [];
  const y0 = d.yokeY + 0.35;
  const y1 = d.headCY + d.aIn * 0.95;
  for (let k = 0; k < crosses; k++) {
    const y = y0 + ((y1 - y0) * k) / Math.max(1, crosses - 1);
    const half = d.bIn * Math.sqrt(Math.max(0, 1 - ((y - d.headCY) / d.aIn) ** 2));
    c.push({ from: [-half, y], to: [half, y] });
  }
  return { mains: m, crosses: c };
}

export function toPath(pts: Pt[], close = true): string {
  return pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join(" ") + (close ? " Z" : "");
}
