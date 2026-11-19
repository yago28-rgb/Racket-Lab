"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { questions, isAnswered, stringTypeOptions, tensionOptions, type Question } from "@/lib/recommendation/questions";
import { emptyAnswers, type FinderAnswers } from "@/lib/recommendation/types";
import { recommend } from "@/lib/recommendation/engine";
import { getAllRackets } from "@/lib/catalog";
import { cn } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { FinderResults } from "./FinderResults";

const STORAGE_KEY = "racketlab-finder";

function OptionButton({
  selected,
  label,
  hint,
  onClick,
  multi,
}: {
  selected: boolean;
  label: string;
  hint?: string;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "group flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-300",
        selected ? "border-ink bg-ink text-white shadow-[0_12px_30px_-14px_rgba(0,0,0,0.5)]" : "border-line bg-white hover:border-ink/40",
      )}
    >
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {hint && <span className={cn("mt-0.5 block text-[13px]", selected ? "text-white/60" : "text-muted")}>{hint}</span>}
      </span>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center border transition-colors",
          multi ? "rounded-md" : "rounded-full",
          selected ? "border-white bg-white text-ink" : "border-line",
        )}
      >
        {selected && <Check size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}

function QuestionBody({ q, a, set }: { q: Question; a: FinderAnswers; set: (patch: Partial<FinderAnswers>) => void }) {
  switch (q.kind) {
    case "single":
      return (
        <div role="radiogroup" aria-label={q.title} className="grid gap-3 sm:grid-cols-2">
          {q.options.map((o) => (
            <OptionButton
              key={o.value}
              label={o.label}
              hint={o.hint}
              selected={a[q.id] === o.value}
              onClick={() => set({ [q.id]: a[q.id] === o.value && q.optional ? null : o.value } as Partial<FinderAnswers>)}
            />
          ))}
        </div>
      );
    case "multi": {
      const cur = a[q.id] as string[];
      return (
        <div role="group" aria-label={q.title} className="grid gap-3 sm:grid-cols-2">
          {q.options.map((o) => (
            <OptionButton
              key={o.value}
              multi
              label={o.label}
              selected={cur.includes(o.value)}
              onClick={() =>
                set({ [q.id]: cur.includes(o.value) ? cur.filter((v) => v !== o.value) : [...cur, o.value] } as Partial<FinderAnswers>)
              }
            />
          ))}
        </div>
      );
    }
    case "slider":
      return (
        <div className="rounded-3xl border border-line bg-white p-6 md:p-10">
          <div className="flex items-end justify-between">
            <span className={cn("text-sm transition-colors", a.powerControl < 40 ? "font-semibold text-ink" : "text-muted")}>Máxima potencia</span>
            <span className="text-5xl font-semibold tracking-tighter tabular-nums">{a.powerControl}</span>
            <span className={cn("text-sm transition-colors", a.powerControl > 60 ? "font-semibold text-ink" : "text-muted")}>Máximo control</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={a.powerControl}
            onChange={(e) => set({ powerControl: Number(e.target.value) })}
            className="rl-range mt-8"
            style={{ ["--val" as string]: `${a.powerControl}%` }}
            aria-label="Equilibrio entre potencia (0) y control (100)"
            aria-valuetext={`${a.powerControl} de 100`}
          />
          <p className="mt-6 text-sm text-muted">
            {a.powerControl < 35
              ? "Quieres que la raqueta te ayude a dar profundidad con poco esfuerzo."
              : a.powerControl > 65
                ? "Generas tu propia potencia y buscas dirigir la bola con precisión."
                : "Buscas un equilibrio entre ayuda en la salida de bola y control."}
          </p>
        </div>
      );
    case "strings":
      return (
        <div className="grid gap-10">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Tipo de cuerda que usas o prefieres</h3>
            <div role="radiogroup" aria-label="Tipo de cuerda" className="grid gap-3 sm:grid-cols-2">
              {stringTypeOptions.map((o) => (
                <OptionButton
                  key={o.value}
                  label={o.label}
                  selected={a.stringType === o.value}
                  onClick={() => set({ stringType: a.stringType === o.value ? null : (o.value as FinderAnswers["stringType"]) })}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Tensión habitual</h3>
            <div role="radiogroup" aria-label="Tensión" className="grid gap-3 sm:grid-cols-3">
              {tensionOptions.map((o) => (
                <OptionButton
                  key={o.value}
                  label={o.label}
                  selected={a.tension === o.value}
                  onClick={() => set({ tension: a.tension === o.value ? null : (o.value as FinderAnswers["tension"]) })}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              No existe una tensión universal: la recomendaremos dentro del rango del fabricante de cada raqueta, según tu cuerda y tus preferencias.
            </p>
          </div>
        </div>
      );
    case "personal":
      return (
        <div className="grid gap-6 rounded-3xl border border-line bg-white p-6 md:p-8">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Edad (opcional)</span>
            <input
              type="number"
              inputMode="numeric"
              min={8}
              max={99}
              value={a.age ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? null : Math.max(8, Math.min(99, Number(e.target.value)));
                set({ age: v });
              }}
              className="h-12 w-40 rounded-xl border border-line px-4 outline-none focus:border-ink"
              placeholder="—"
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={a.armIssues} onChange={(e) => set({ armIssues: e.target.checked })} className="mt-1 h-4 w-4 accent-[#111]" />
            <span className="text-sm">
              <span className="font-medium">Tengo o he tenido molestias en el codo, la muñeca o el hombro</span>
              <span className="mt-0.5 block text-muted">Daremos más peso a la comodidad y a los marcos flexibles. No sustituye el consejo de un profesional sanitario.</span>
            </span>
          </label>
        </div>
      );
  }
}

export function FinderFlow() {
  const [answers, setAnswers] = useState<FinderAnswers>(emptyAnswers);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [dir, setDir] = useState(1);

  // Restore an in-progress or finished session (this browser only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { answers: FinderAnswers; step: number; done: boolean };
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      setAnswers({ ...emptyAnswers, ...saved.answers });
      setStep(Math.min(saved.step, questions.length - 1));
      setDone(saved.done);
    } catch {
      /* ignore corrupted storage */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step, done }));
    } catch {
      /* storage unavailable */
    }
  }, [answers, step, done]);

  const q = questions[step];
  const canNext = isAnswered(q, answers);
  const progress = done ? 1 : step / questions.length;
  const result = useMemo(() => (done ? recommend(getAllRackets(), answers) : null), [done, answers]);

  const set = (patch: Partial<FinderAnswers>) => setAnswers((a) => ({ ...a, ...patch }));
  const next = () => {
    if (!canNext) return;
    setDir(1);
    if (step === questions.length - 1) {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else setStep((s) => s + 1);
  };
  const back = () => {
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };
  const restart = () => {
    setAnswers(emptyAnswers);
    setStep(0);
    setDone(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Progress */}
      <div className="sticky top-14 z-30 border-b border-line bg-white/85 backdrop-blur-xl">
        <div className="container-rl flex h-12 items-center gap-4">
          <span className="font-mono text-xs tabular-nums text-muted">
            {done ? "Resultado" : `${String(step + 1).padStart(2, "0")} / ${questions.length}`}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Progreso del cuestionario">
            <motion.div className="h-full rounded-full bg-ink" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
          </div>
          {(done || step > 0) && (
            <button onClick={restart} className="text-xs text-muted hover:text-ink">
              Empezar de nuevo
            </button>
          )}
        </div>
      </div>

      {done && result ? (
        <FinderResults result={result} answers={answers} onEdit={() => { setDone(false); setStep(0); }} />
      ) : (
        <div className="container-rl max-w-3xl py-14 md:py-20">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={q.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow">
                Pregunta {step + 1}
                {q.optional && " · opcional"}
              </p>
              <h2 className="mt-4 text-[clamp(1.9rem,4.5vw,3.2rem)] font-semibold leading-[1.05] tracking-tight">{q.title}</h2>
              {q.subtitle && <p className="mt-3 text-ink/60">{q.subtitle}</p>}
              {q.note && <p className="mt-3 rounded-xl bg-mist px-4 py-3 text-sm text-ink/70">{q.note}</p>}
              <div className="mt-10">
                <QuestionBody q={q} a={answers} set={set} />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              <ArrowLeft size={16} /> Atrás
            </Button>
            <Button onClick={next} disabled={!canNext} size="lg">
              {step === questions.length - 1 ? "Ver mi raqueta" : q.optional && !hasValue(q, answers) ? "Saltar" : "Continuar"}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function hasValue(q: Question, a: FinderAnswers) {
  if (q.kind === "strings") return a.stringType != null || a.tension != null;
  if (q.kind === "personal") return a.age != null || a.armIssues;
  if (q.kind === "slider") return true;
  const v = a[q.id as keyof FinderAnswers];
  return Array.isArray(v) ? v.length > 0 : v != null;
}
