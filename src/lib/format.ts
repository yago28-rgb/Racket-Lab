import type { PlayerLevel, PlayStyle, Racket, RacketType } from "@/types/product";
import { brands } from "@/data/brands";

const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function formatPrice(amount: number | null | undefined): string {
  return amount == null ? "Precio por confirmar" : eur.format(amount);
}

export function formatEUR(amount: number): string {
  return eur.format(amount);
}

export function racketName(r: Racket): string {
  return `${brands[r.brand].name} ${r.model}`;
}

export function fullRacketName(r: Racket): string {
  return `${brands[r.brand].name} ${r.model} ${r.generation}`;
}

export const pending = "Pendiente";

export function fmtWeight(g: number | null) {
  return g == null ? pending : `${g} g`;
}
export function fmtHead(sq: number | null) {
  return sq == null ? pending : `${sq} in²`;
}
export function fmtBalance(mm: number | null) {
  if (mm == null) return pending;
  return `${mm} mm · ${balanceLabel(mm)}`;
}
/** 27" racket: even balance ≈ 343 mm; 1 point = 1/8" ≈ 3.175 mm. */
export function balancePoints(mm: number, lengthIn = 27): number {
  const even = (lengthIn * 25.4) / 2;
  return Math.round((even - mm) / 3.175);
}
export function balanceLabel(mm: number): string {
  const pts = balancePoints(mm);
  if (pts > 0) return `${pts} pts HL`;
  if (pts < 0) return `${-pts} pts HH`;
  return "Neutro";
}
export function fmtPattern(p: Racket["specs"]["pattern"]) {
  return p == null ? pending : `${p.mains}×${p.crosses}`;
}
export function fmtRA(ra: number | null) {
  return ra == null ? pending : `${ra} RA`;
}
export function fmtSW(sw: number | null) {
  return sw == null ? pending : `${sw}`;
}
export function fmtLength(l: number | null) {
  return l == null ? pending : `${l}" · ${(l * 2.54).toFixed(1)} cm`;
}
export function fmtTension(t: [number, number] | null) {
  return t == null ? "Consultar rango del fabricante" : `${t[0]}–${t[1]} kg`;
}

export const levelLabels: Record<PlayerLevel, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
  competition: "Competición",
};

export const styleLabels: Record<PlayStyle, string> = {
  "baseline-aggressive": "Agresivo de fondo",
  defensive: "Defensivo",
  "all-court": "Todo terreno",
  "serve-volley": "Saque y volea",
  counterpuncher: "Contraataque",
  control: "Control",
};

export const typeLabels: Record<RacketType, string> = {
  power: "Potencia",
  spin: "Efecto",
  control: "Control",
  "all-round": "Polivalente",
  comfort: "Confort",
};

export function levelRange(levels: PlayerLevel[]): string {
  const order: PlayerLevel[] = ["beginner", "intermediate", "advanced", "competition"];
  const sorted = [...levels].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  if (sorted.length === 0) return pending;
  if (sorted.length === 1) return levelLabels[sorted[0]];
  return `${levelLabels[sorted[0]]} – ${levelLabels[sorted[sorted.length - 1]]}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
