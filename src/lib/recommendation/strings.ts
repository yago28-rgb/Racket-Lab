import type { Racket } from "@/types/product";
import type { FinderAnswers, TensionPref } from "./types";

/**
 * String and tension guidance. Deliberately does NOT output a universal
 * tension: it positions the player inside the manufacturer's published range
 * (when known) and otherwise gives relative advice only.
 */

const tensionBuckets: Record<Exclude<TensionPref, "unknown">, [number, number]> = {
  lt21: [18, 20.9],
  "21-23": [21, 23],
  "23-25": [23, 25],
  gt25: [25.1, 28],
};

export interface StringAdvice {
  stringType: string;
  tension: string;
  warnings: string[];
}

export function stringAdvice(r: Racket, a: FinderAnswers): StringAdvice {
  const warnings: string[] = [];
  const stiff = r.specs.stiffnessRA;
  const control = a.powerControl / 100;

  // String type
  let stringType: string;
  if (a.armIssues) {
    stringType =
      a.stringType === "poly"
        ? "Con molestias en el brazo, considera pasar a multifilamento, tripa natural o un híbrido (poliéster solo en las verticales)."
        : "Multifilamento o tripa natural: son los materiales que mejor amortiguan el impacto.";
    if (stiff != null && stiff >= 68) warnings.push(`Marco rígido (${stiff} RA): valora un modelo más flexible si las molestias persisten.`);
  } else if (a.stringType === "poly" || a.feel.includes("spin")) {
    stringType = "Monofilamento / poliéster: más control del efecto y durabilidad. Cambia la cuerda con frecuencia, pierde tensión con el uso.";
  } else if (a.stringType === "gut") {
    stringType = "Tripa natural: máxima sensación y mantenimiento de tensión; más cara y sensible a la humedad.";
  } else if (a.stringType === "hybrid") {
    stringType = "Híbrido: poliéster en verticales para control y efecto, multifilamento o tripa en horizontales para comodidad.";
  } else {
    stringType = "Multifilamento: buena opción para empezar por comodidad y potencia; cambia a poliéster si rompes cuerdas a menudo.";
  }

  // Tension
  let tension: string;
  const range = r.specs.tensionRangeKg;
  if (range) {
    const [lo, hi] = range;
    // Position inside the manufacturer's range: more control → higher; poly/comfort → lower.
    let pos = 0.5 + (control - 0.5) * 0.5;
    if (a.stringType === "poly") pos -= 0.2;
    if (a.armIssues) pos -= 0.2;
    pos = Math.min(1, Math.max(0, pos));
    const centre = lo + (hi - lo) * pos;
    const from = Math.max(lo, Math.round((centre - 0.5) * 2) / 2);
    const to = Math.min(hi, from + 1);
    tension = `Punto de partida: ${from.toFixed(1)}–${to.toFixed(1)} kg, dentro del rango del fabricante (${lo}–${hi} kg). Ajusta en pasos de 0,5–1 kg según sensaciones.`;
    if (a.tension && a.tension !== "unknown") {
      const [tlo, thi] = tensionBuckets[a.tension];
      if (thi < lo || tlo > hi) {
        warnings.push(`Tu tensión habitual queda fuera del rango publicado (${lo}–${hi} kg) para este marco.`);
      }
    }
  } else {
    tension =
      "El fabricante no publica un rango verificado en nuestra base de datos. Empieza en la zona media del rango indicado en el marco y, con poliéster, en su parte baja.";
  }

  return { stringType, tension, warnings };
}

export const gripAdvice =
  "Mide desde el pliegue central de la palma hasta la punta del dedo anular. Las tallas (L1–L5) varían ligeramente entre fabricantes: si dudas entre dos, elige la menor y ajusta con un overgrip.";
