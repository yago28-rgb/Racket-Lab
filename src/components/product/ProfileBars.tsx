import type { RacketProfile } from "@/lib/recommendation/types";

const labels: [keyof RacketProfile, string][] = [
  ["power", "Potencia"],
  ["control", "Control"],
  ["spin", "Efecto"],
  ["comfort", "Comodidad"],
  ["stability", "Estabilidad"],
  ["maneuverability", "Manejabilidad"],
];

/** Catalogue-relative playability profile derived from specs (see lib/recommendation/profile.ts). */
export function ProfileBars({ profile, dark = false }: { profile: RacketProfile; dark?: boolean }) {
  return (
    <ul className="space-y-3">
      {labels.map(([k, l]) => (
        <li key={k} className="grid grid-cols-[110px_1fr_36px] items-center gap-3 text-sm">
          <span className={dark ? "text-white/60" : "text-muted"}>{l}</span>
          <span className={`h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-line"}`}>
            <span
              className={`block h-full rounded-full ${dark ? "bg-white" : "bg-ink"}`}
              style={{ width: `${Math.round(8 + profile[k] * 92)}%` }}
            />
          </span>
          <span className={`text-right text-xs tabular-nums ${dark ? "text-white/50" : "text-muted"}`}>{Math.round(profile[k] * 10)}/10</span>
        </li>
      ))}
    </ul>
  );
}
