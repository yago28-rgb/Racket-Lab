import type { Racket } from "@/types/product";
import { fmtBalance, fmtHead, fmtLength, fmtPattern, fmtRA, fmtSW, fmtTension, fmtWeight, pending } from "@/lib/format";

export function specRows(r: Racket): [string, string, string?][] {
  const s = r.specs;
  return [
    ["Peso sin encordar", fmtWeight(s.weightUnstrungG)],
    ["Tamaño de cabeza", fmtHead(s.headSizeSqIn)],
    ["Balance sin encordar", fmtBalance(s.balanceUnstrungMm)],
    ["Patrón de encordado", fmtPattern(s.pattern)],
    ["Rigidez", fmtRA(s.stiffnessRA), "Medición de tienda; puede variar ±3 RA entre fuentes."],
    ["Swingweight", fmtSW(s.swingweight), "Encordada, kg·cm². Varía entre unidades."],
    ["Longitud", fmtLength(s.lengthIn)],
    ["Perfil", s.beamMm ? `${s.beamMm} mm` : pending],
    ["Tensión recomendada", fmtTension(s.tensionRangeKg)],
  ];
}

export function SpecTable({ racket }: { racket: Racket }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {specRows(racket).map(([k, v, hint]) => (
        <div key={k} className="grid grid-cols-[1fr_auto] gap-4 py-3.5 text-sm">
          <dt className="text-muted">
            {k}
            {hint && <span className="mt-0.5 block text-[11px] text-muted/80">{hint}</span>}
          </dt>
          <dd className={v === pending ? "text-muted italic" : "font-medium tabular-nums"}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
