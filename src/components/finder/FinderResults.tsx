"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowRight, ChevronDown, Pencil } from "lucide-react";
import type { FinderAnswers, Recommendation, ScoredRacket } from "@/lib/recommendation/types";
import { stringAdvice, gripAdvice } from "@/lib/recommendation/strings";
import { brands } from "@/data/brands";
import { fmtBalance, fmtHead, fmtPattern, fmtRA, fmtSW, fmtWeight, formatPrice, cn } from "@/lib/format";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProfileBars } from "@/components/product/ProfileBars";
import { ButtonLink, Button } from "@/components/ui/Button";
import { useCompare } from "@/store/compare";
import { useRouter } from "next/navigation";

function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) return;
    const c = animate(0, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [value, reduced]);
  return <>{reduced ? value : n}</>;
}

function FactorBreakdown({ s, dark }: { s: ScoredRacket; dark?: boolean }) {
  return (
    <ul className="space-y-3">
      {s.factors.map((f) => (
        <li key={f.id} className="text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className={dark ? "text-white/80" : ""}>
              {f.label} <span className={dark ? "text-white/40" : "text-muted"}>· peso {f.weight}</span>
            </span>
            <span className={cn("tabular-nums", dark ? "text-white/60" : "text-muted")}>{f.score == null ? "sin datos" : `${Math.round(f.score * 100)}`}</span>
          </div>
          <div className={cn("mt-1.5 h-1 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-line")}>
            <motion.div
              className={cn("h-full rounded-full", f.score == null ? "bg-transparent" : dark ? "bg-accent" : "bg-ink")}
              initial={{ width: 0 }}
              whileInView={{ width: `${(f.score ?? 0) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className={cn("mt-1 text-xs", dark ? "text-white/45" : "text-muted")}>{f.detail}</p>
        </li>
      ))}
    </ul>
  );
}

function AltCard({ title, s, note }: { title: string; s: ScoredRacket | null; note?: string | null }) {
  if (!s) {
    return (
      <div className="flex flex-col rounded-[var(--radius-card)] border border-dashed border-line p-6">
        <p className="eyebrow">{title}</p>
        <p className="mt-4 text-sm text-muted">{note ?? "Ninguna alternativa cumple el criterio con los datos actuales."}</p>
      </div>
    );
  }
  const r = s.racket;
  return (
    <Link href={`/raquetas/${r.slug}`} className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
      <p className="eyebrow">{title}</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="studio-bg relative h-28 w-20 shrink-0 overflow-hidden rounded-xl p-1">
          <ProductMedia racket={r} uid={`alt-${title}`} angle={-15} sizes="80px" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">{brands[r.brand].name}</p>
          <p className="font-semibold leading-tight">
            {r.model} <span className="font-normal text-muted">{r.generation}</span>
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{s.compatibility}%</p>
          <p className="text-sm text-muted">{formatPrice(r.price.amount)}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-ink/70">{s.strengths[0]}</p>
      <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium">
        Ver raqueta <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function FinderResults({ result, answers, onEdit }: { result: Recommendation; answers: FinderAnswers; onEdit: () => void }) {
  const best = result.best;
  const [showAll, setShowAll] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const router = useRouter();
  const compareClear = useCompare((s) => s.clear);
  const compareToggle = useCompare((s) => s.toggle);

  if (!best) {
    return (
      <div className="container-rl py-24 text-center">
        <p>No hay raquetas en el catálogo para evaluar.</p>
      </div>
    );
  }
  const r = best.racket;
  const advice = stringAdvice(r, answers);

  const compareTop = () => {
    compareClear();
    result.topThree.forEach((s) => compareToggle(s.racket.id));
    router.push("/comparar");
  };

  return (
    <div>
      {/* Best match */}
      <section className="noir-bg text-white">
        <div className="container-rl grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.1fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">Your perfect match</p>
            <p className="mt-6 text-white/50">{brands[r.brand].name}</p>
            <h2 className="display text-[clamp(2.6rem,6vw,5rem)]">
              {r.model} <span className="text-white/35">{r.generation}</span>
            </h2>
            <div className="mt-8 flex items-end gap-6">
              <p className="text-[clamp(4.5rem,10vw,8rem)] font-semibold leading-none tracking-tighter tabular-nums">
                <CountUp value={best.compatibility} />
                <span className="text-[0.35em] text-white/40">%</span>
              </p>
              <div className="pb-3 text-sm text-white/55">
                compatibilidad
                <br />
                calculada
              </div>
            </div>
            {best.insufficientData && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-sm text-white/70">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent" />
                Datos insuficientes: solo se ha podido evaluar el {Math.round(best.confidence * 100)}% del peso del modelo.
              </p>
            )}
            <p className="mt-6 text-2xl">{formatPrice(r.price.amount)}</p>
            <dl className="mt-6 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
              {[
                ["Peso", fmtWeight(r.specs.weightUnstrungG)],
                ["Cabeza", fmtHead(r.specs.headSizeSqIn)],
                ["Patrón", fmtPattern(r.specs.pattern)],
                ["Balance", fmtBalance(r.specs.balanceUnstrungMm).split(" · ")[0]],
                ["Rigidez", fmtRA(r.specs.stiffnessRA)],
                ["Swingweight", fmtSW(r.specs.swingweight)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-white/45">{k}</dt>
                  <dd className="mt-0.5 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href={`/raquetas/${r.slug}`} variant="inverted" size="lg">
                Ver raqueta
              </ButtonLink>
              <Button variant="outline-inverted" size="lg" onClick={compareTop}>
                Comparar el top 3
              </Button>
            </div>
          </motion.div>
          <motion.div
            className="relative mx-auto aspect-[3/4] w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(60%_50%_at_50%_45%,rgba(255,255,255,0.14),transparent)]" />
            <ProductMedia racket={r} uid="best" angle={-16} priority />
          </motion.div>
        </div>
      </section>

      {/* Why */}
      <section className="container-rl grid gap-12 py-20 lg:grid-cols-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Por qué encaja contigo</h2>
          <ul className="mt-6 space-y-4">
            {best.strengths.map((t) => (
              <li key={t} className="flex gap-3 text-ink/80">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                {t}
              </li>
            ))}
          </ul>
          {best.drawbacks.length > 0 && (
            <>
              <h3 className="mt-10 text-sm font-semibold">A tener en cuenta</h3>
              <ul className="mt-4 space-y-3 text-sm text-ink/70">
                {best.drawbacks.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full border border-ink" />
                    {t}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Perfil de juego</h2>
          <p className="mt-2 text-sm text-muted">Relativo al resto del catálogo.</p>
          <div className="mt-6">
            <ProfileBars profile={best.profile} />
          </div>
          <button onClick={() => setShowModel((v) => !v)} className="mt-8 flex items-center gap-1.5 text-sm font-medium" aria-expanded={showModel}>
            Cómo se ha calculado <ChevronDown size={15} className={cn("transition-transform", showModel && "rotate-180")} />
          </button>
          {showModel && (
            <div className="mt-5">
              <FactorBreakdown s={best} />
              <p className="mt-5 text-xs leading-relaxed text-muted">
                Compatibilidad = media ponderada de los factores evaluables (0–100), ligeramente reducida si faltan datos. Los factores que no aplican a tus
                respuestas no se puntúan. Pesos configurables en <code>lib/recommendation/weights.ts</code>.
              </p>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cuerda, tensión y empuñadura</h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="font-medium">Cuerda</dt>
              <dd className="mt-1 text-ink/70">{advice.stringType}</dd>
            </div>
            <div>
              <dt className="font-medium">Tensión</dt>
              <dd className="mt-1 text-ink/70">{advice.tension}</dd>
            </div>
            <div>
              <dt className="font-medium">Empuñadura{answers.grip && answers.grip !== "unknown" ? ` · tu talla ${answers.grip}` : ""}</dt>
              <dd className="mt-1 text-ink/70">{gripAdvice}</dd>
            </div>
          </dl>
          {advice.warnings.length > 0 && (
            <ul className="mt-6 space-y-2">
              {advice.warnings.map((w) => (
                <li key={w} className="flex gap-2 rounded-xl bg-mist p-3 text-sm text-ink/75">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Alternatives */}
      <section className="bg-mist py-20">
        <div className="container-rl">
          <h2 className="display text-[clamp(1.8rem,4vw,3rem)]">Alternativas</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <AltCard title="Segunda opción" s={result.topThree[1] ?? null} />
            <AltCard title="Más económica" s={result.budgetAlternative} note={result.budgetNote} />
            <AltCard title="Más rendimiento" s={result.performanceAlternative} note="Ninguna alternativa compatible ofrece claramente más estabilidad y masa." />
          </div>

          <button onClick={() => setShowAll((v) => !v)} className="mt-12 flex items-center gap-1.5 text-sm font-medium" aria-expanded={showAll}>
            Ranking completo ({result.ranked.length}) <ChevronDown size={15} className={cn("transition-transform", showAll && "rotate-180")} />
          </button>
          {showAll && (
            <ol className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
              {result.ranked.map((s, i) => (
                <li key={s.racket.id}>
                  <Link href={`/raquetas/${s.racket.slug}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-mist">
                    <span className="w-6 font-mono text-xs text-muted">{i + 1}</span>
                    <span className="flex-1 text-sm">
                      {brands[s.racket.brand].name} {s.racket.model} <span className="text-muted">{s.racket.generation}</span>
                      {s.insufficientData && <span className="ml-2 text-xs text-muted">· datos incompletos</span>}
                    </span>
                    <span className="w-24 text-right text-sm text-muted">{formatPrice(s.racket.price.amount)}</span>
                    <span className="w-12 text-right text-sm font-semibold tabular-nums">{s.compatibility}%</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
          {result.excludedCount > 0 && (
            <p className="mt-4 text-xs text-muted">{result.excludedCount} raquetas se descartaron por incompatibilidad clara con tu nivel o tus preferencias de peso y cabeza.</p>
          )}
          {result.notes.map((n) => (
            <p key={n} className="mt-2 text-xs text-muted">
              {n}
            </p>
          ))}
        </div>
      </section>

      <section className="container-rl py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[var(--radius-card)] border border-line p-8 md:flex-row md:items-center">
          <p className="max-w-2xl text-sm leading-relaxed text-ink/70">
            <strong className="text-ink">Recomendación orientativa.</strong> Se basa en especificaciones publicadas y en un modelo de puntuación transparente. No sustituye
            probar la raqueta en pista: el peso, el balance y el swingweight reales varían entre unidades.
          </p>
          <Button variant="secondary" onClick={onEdit}>
            <Pencil size={15} /> Editar respuestas
          </Button>
        </div>
      </section>
    </div>
  );
}
