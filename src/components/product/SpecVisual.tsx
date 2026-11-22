"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PlayerLevel, Racket } from "@/types/product";
import { balanceLabel, cn, levelLabels } from "@/lib/format";

export interface SpecRanges {
  weight: [number, number];
  head: [number, number];
  stiffness: [number, number];
  swingweight: [number, number];
}

const LEVELS: PlayerLevel[] = ["beginner", "intermediate", "advanced", "competition"];
const ease = [0.16, 1, 0.3, 1] as const;

function pct(v: number, [lo, hi]: [number, number]) {
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo || 1)));
}

function Row({ label, value, unit, children, note }: { label: string; value: string; unit?: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-6 gap-y-3 border-t border-current/15 py-5">
      <p className="text-[13px] uppercase tracking-[0.14em] opacity-60">{label}</p>
      <p className="text-right">
        <span className="text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold leading-none tracking-[-0.03em] tabular-nums">{value}</span>
        {unit && <span className="ml-1 text-[15px] opacity-60">{unit}</span>}
      </p>
      <div className="col-span-2">{children}</div>
      {note && <p className="col-span-2 -mt-1 text-[12px] opacity-55">{note}</p>}
    </div>
  );
}

/** A value on the catalogue's real range: thin track, solid fill, end marker. */
function Meter({ p, lo, hi }: { p: number; lo: string; hi: string }) {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="relative h-[3px] rounded-full bg-current/15">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left rounded-full bg-current"
          style={{ width: `${Math.max(3, p * 100)}%` }}
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, ease }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] tabular-nums opacity-45">
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
    </div>
  );
}

/**
 * Elegant, data-true presentation of a racket's key specifications. Every
 * scale is the catalogue's real minimum and maximum; missing values say so.
 */
export function SpecVisual({ racket, ranges, tone = "light", className }: { racket: Racket; ranges: SpecRanges; tone?: "light" | "dark"; className?: string }) {
  const s = racket.specs;
  const reduced = useReducedMotion();
  const lengthMm = (s.lengthIn ?? 27) * 25.4;
  return (
    <div className={cn(tone === "dark" ? "text-paper" : "text-ink", className)}>
      {s.weightUnstrungG != null && (
        <Row label="Peso sin encordar" value={String(s.weightUnstrungG)} unit="g">
          <Meter p={pct(s.weightUnstrungG, ranges.weight)} lo={`${ranges.weight[0]} g`} hi={`${ranges.weight[1]} g`} />
        </Row>
      )}

      {s.balanceUnstrungMm != null && (
        <Row label="Balance" value={String(s.balanceUnstrungMm)} unit="mm" note={`${balanceLabel(s.balanceUnstrungMm)} · medido desde el puño`}>
          {/* The racket's length as a line: neutral point in the middle, balance as a marker. */}
          <div className="relative h-6">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current/25" />
            <div className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-current/50" />
            <div className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-current/50" />
            <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-y-1/2 bg-current/40" />
            <motion.div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
              style={{ left: `${(s.balanceUnstrungMm / lengthMm) * 100}%` }}
              initial={reduced ? false : { opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] opacity-45">
            <span>Puño</span>
            <span>Punto neutro</span>
            <span>Cabeza</span>
          </div>
        </Row>
      )}

      {s.headSizeSqIn != null && (
        <Row label="Tamaño de cabeza" value={String(s.headSizeSqIn)} unit="in²">
          <Meter p={pct(s.headSizeSqIn, ranges.head)} lo={`${ranges.head[0]} in²`} hi={`${ranges.head[1]} in²`} />
        </Row>
      )}

      {s.pattern && (
        <Row label="Patrón de cordaje" value={`${s.pattern.mains}×${s.pattern.crosses}`} note={s.pattern.mains * s.pattern.crosses <= 304 ? "Abierto: más efecto y salida de bola" : "Denso: más control y durabilidad"}>
          {/* Density as a strip of verticals: one line per main string. */}
          <div className="flex h-6 items-stretch justify-between" aria-hidden>
            {Array.from({ length: s.pattern.mains }).map((_, i) => (
              <motion.span
                key={i}
                className="w-px origin-bottom bg-current/60"
                initial={reduced ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: i * 0.025 }}
              />
            ))}
          </div>
        </Row>
      )}

      <Row label="Nivel recomendado" value={racket.levels.length > 1 ? `${levelLabels[racket.levels[0]]}+` : levelLabels[racket.levels[0]]}>
        <div className="grid grid-cols-4 gap-1.5">
          {LEVELS.map((l, i) => {
            const on = racket.levels.includes(l);
            return (
              <div key={l}>
                <motion.div
                  className={cn("h-[3px] origin-left rounded-full", on ? "bg-current" : "bg-current/15")}
                  initial={reduced ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease, delay: i * 0.08 }}
                />
                <p className={cn("mt-2 text-[11px]", on ? "opacity-80" : "opacity-35")}>{levelLabels[l]}</p>
              </div>
            );
          })}
        </div>
      </Row>

      {(s.stiffnessRA != null || s.swingweight != null) && (
        <div className="grid grid-cols-2 gap-6 border-t border-current/15 pt-5">
          {s.stiffnessRA != null && (
            <div>
              <p className="text-[13px] uppercase tracking-[0.14em] opacity-60">Rigidez</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {s.stiffnessRA} <span className="text-[14px] font-normal opacity-60">RA</span>
              </p>
              <div className="mt-3">
                <Meter p={pct(s.stiffnessRA, ranges.stiffness)} lo={String(ranges.stiffness[0])} hi={String(ranges.stiffness[1])} />
              </div>
            </div>
          )}
          {s.swingweight != null && (
            <div>
              <p className="text-[13px] uppercase tracking-[0.14em] opacity-60">Swingweight</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{s.swingweight}</p>
              <div className="mt-3">
                <Meter p={pct(s.swingweight, ranges.swingweight)} lo={String(ranges.swingweight[0])} hi={String(ranges.swingweight[1])} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
