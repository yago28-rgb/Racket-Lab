import type { FinderAnswers } from "./types";

/**
 * Declarative questionnaire. The UI renders these generically; adding or
 * reordering questions does not require UI changes.
 */

export interface Option<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
}

export type Question =
  | {
      id: keyof FinderAnswers;
      kind: "single";
      title: string;
      subtitle?: string;
      note?: string;
      options: Option[];
      optional?: boolean;
    }
  | {
      id: keyof FinderAnswers;
      kind: "multi";
      title: string;
      subtitle?: string;
      note?: string;
      options: Option[];
      optional?: boolean;
    }
  | { id: "powerControl"; kind: "slider"; title: string; subtitle?: string; note?: string; optional?: boolean }
  | { id: "strings"; kind: "strings"; title: string; subtitle?: string; note?: string; optional?: boolean }
  | { id: "personal"; kind: "personal"; title: string; subtitle?: string; note?: string; optional: true };

export const questions: Question[] = [
  {
    id: "level",
    kind: "single",
    title: "¿Cuál es tu nivel de juego?",
    options: [
      { value: "beginner", label: "Principiante", hint: "Aprendiendo la técnica básica" },
      { value: "intermediate", label: "Intermedio", hint: "Intercambios consistentes, partidos de club" },
      { value: "advanced", label: "Avanzado", hint: "Golpes completos y variados" },
      { value: "competition", label: "Competición / Profesional", hint: "Torneos federados con regularidad" },
    ],
  },
  {
    id: "style",
    kind: "single",
    title: "¿Cómo juegas?",
    options: [
      { value: "baseline-aggressive", label: "Agresivo de fondo", hint: "Baseline Aggressive: dominas con golpes potentes" },
      { value: "defensive", label: "Defensivo", hint: "Devuelves todo y desgastas al rival" },
      { value: "all-court", label: "Todo terreno", hint: "All Court: cómodo en cualquier zona" },
      { value: "serve-volley", label: "Saque y volea", hint: "Serve & Volley: buscas la red" },
      { value: "counterpuncher", label: "Contraataque", hint: "Counterpuncher: usas el ritmo del rival" },
      { value: "control", label: "Control", hint: "Control Player: precisión ante todo" },
    ],
  },
  {
    id: "weight",
    kind: "single",
    title: "¿Qué peso prefieres?",
    note: "Peso sin encordar. El cordaje y la empuñadura añaden aproximadamente 15–20 g.",
    options: [
      { value: "lt270", label: "Menos de 270 g" },
      { value: "270-285", label: "270–285 g" },
      { value: "285-300", label: "285–300 g" },
      { value: "300-315", label: "300–315 g" },
      { value: "gt315", label: "Más de 315 g" },
      { value: "auto", label: "No lo sé / Recomiéndame" },
    ],
  },
  {
    id: "powerControl",
    kind: "slider",
    title: "¿Potencia o control?",
    subtitle: "Desliza hacia el lado que más necesitas en tu juego.",
  },
  {
    id: "feel",
    kind: "multi",
    title: "¿Qué sensación buscas?",
    subtitle: "Puedes elegir varias.",
    optional: true,
    options: [
      { value: "spin", label: "Mucho efecto" },
      { value: "power", label: "Potencia y profundidad" },
      { value: "control", label: "Control y precisión" },
      { value: "comfort", label: "Comodidad" },
      { value: "stability", label: "Estabilidad" },
      { value: "classic", label: "Sensación clásica" },
    ],
  },
  {
    id: "head",
    kind: "single",
    title: "¿Qué tamaño de cabeza prefieres?",
    note: "Más superficie = más potencia y tolerancia; menos superficie = más precisión.",
    options: [
      { value: "85-97", label: "85–97 in²", hint: "Midsize: precisión" },
      { value: "98-100", label: "98–100 in²", hint: "Midplus: el estándar actual" },
      { value: "101-105", label: "101–105 in²", hint: "Oversize ligero" },
      { value: "gt105", label: "Más de 105 in²", hint: "Oversize: máxima tolerancia" },
      { value: "unknown", label: "No lo sé" },
    ],
  },
  {
    id: "strings",
    kind: "strings",
    title: "Cuerda y tensión",
    subtitle: "Son dos decisiones distintas: el material y la tensión a la que se monta.",
    optional: true,
  },
  {
    id: "grip",
    kind: "single",
    title: "¿Qué talla de empuñadura usas?",
    note: "Compruébala midiendo tu mano: las tallas varían ligeramente según el fabricante.",
    optional: true,
    options: [
      { value: "L1", label: "L1" },
      { value: "L2", label: "L2" },
      { value: "L3", label: "L3" },
      { value: "L4", label: "L4" },
      { value: "L5", label: "L5" },
      { value: "unknown", label: "No lo sé" },
    ],
  },
  {
    id: "surface",
    kind: "single",
    title: "¿Dónde juegas habitualmente?",
    optional: true,
    options: [
      { value: "clay", label: "Tierra batida" },
      { value: "hard", label: "Pista dura" },
      { value: "grass", label: "Hierba" },
      { value: "indoor", label: "Indoor" },
      { value: "mixed", label: "Varias superficies" },
    ],
  },
  {
    id: "frequency",
    kind: "single",
    title: "¿Con qué frecuencia juegas?",
    optional: true,
    options: [
      { value: "1", label: "1 vez por semana" },
      { value: "2-3", label: "2–3 veces por semana" },
      { value: "4-5", label: "4–5 veces por semana" },
      { value: "competition", label: "Competición frecuente" },
    ],
  },
  {
    id: "personal",
    kind: "personal",
    title: "Algo más sobre ti",
    subtitle: "Opcional. No guardamos estos datos: solo se usan en tu navegador para afinar el resultado.",
    optional: true,
  },
];

export const stringTypeOptions: Option[] = [
  { value: "poly", label: "Monofilamento / Poliéster" },
  { value: "multi", label: "Multifilamento" },
  { value: "gut", label: "Tripa natural" },
  { value: "hybrid", label: "Híbrido" },
  { value: "none", label: "No tengo preferencia" },
];

export const tensionOptions: Option[] = [
  { value: "lt21", label: "Menos de 21 kg" },
  { value: "21-23", label: "21–23 kg" },
  { value: "23-25", label: "23–25 kg" },
  { value: "gt25", label: "Más de 25 kg" },
  { value: "unknown", label: "No lo sé" },
];

/** Whether the user can advance past a question. */
export function isAnswered(q: Question, a: FinderAnswers): boolean {
  if (q.optional) return true;
  if (q.kind === "slider") return true;
  const v = a[q.id as keyof FinderAnswers];
  return Array.isArray(v) ? v.length > 0 : v != null;
}
