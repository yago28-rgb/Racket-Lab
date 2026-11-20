import { getAllRackets } from "@/lib/catalog";
import { recommend } from "@/lib/recommendation/engine";
import { emptyAnswers, type FinderAnswers } from "@/lib/recommendation/types";
import { brands } from "@/data/brands";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, WordReveal } from "@/components/ui/Reveal";
import { ProductMedia } from "@/components/product/ProductMedia";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { videos } from "@/lib/media";

/** A real engine run for a sample profile — the preview is computed, not mocked. */
const sample: FinderAnswers = {
  ...emptyAnswers,
  level: "intermediate",
  style: "baseline-aggressive",
  weight: "auto",
  powerControl: 35,
  feel: ["spin"],
  head: "98-100",
  surface: "clay",
};

export function FinderTeaser() {
  const result = recommend(getAllRackets(), sample);
  const best = result.best!;
  return (
    <section className="relative overflow-hidden bg-night py-28 text-white md:py-40" aria-labelledby="finder-title">
      <div className="absolute inset-0">
        <BackgroundVideo base={videos.aerialServe.base} label={videos.aerialServe.label} className="opacity-60" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/85 to-night/40" />
      <div className="container-rl relative grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow !text-white/50">Racket Finder</p>
          <h2 id="finder-title" className="display mt-6 text-[clamp(2.6rem,6vw,5.5rem)]">
            <WordReveal text={"Stop guessing.\nFind your perfect racket."} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/65">
              Once preguntas sobre tu nivel, tu estilo y tus sensaciones. Un modelo de puntuación ponderada compara tus
              respuestas con las especificaciones verificadas de cada raqueta y te explica por qué encaja.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <ol className="mt-10 grid max-w-lg gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
              {["Tu juego en 11 pasos", "10 factores técnicos", "Resultado explicado"].map((t, i) => (
                <li key={t} className="bg-night/80 p-5">
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  <p className="mt-2 text-sm text-white/80">{t}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-10">
              <ButtonLink href="/racket-finder" size="lg" variant="inverted">
                Find my racket
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="relative rounded-[2rem] border border-white/10 bg-night/60 p-6 backdrop-blur-md md:p-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">Your perfect match</p>
              <span className="flex items-center gap-2 text-[11px] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Cálculo real
              </span>
            </div>
            <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <p className="text-sm text-white/50">{brands[best.racket.brand].name}</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {best.racket.model} <span className="text-white/40">{best.racket.generation}</span>
                </p>
                <p className="mt-6 text-6xl font-semibold tracking-tighter tabular-nums">
                  {best.compatibility}
                  <span className="text-2xl text-white/40">%</span>
                </p>
                <p className="text-xs text-white/50">compatibilidad calculada</p>
              </div>
              <div className="relative h-48 w-36 overflow-hidden rounded-2xl bg-[#f3f3f5]">
                <ProductMedia racket={best.racket} sizes="144px" />
              </div>
            </div>
            <ul className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm text-white/70">
              {best.strengths.slice(0, 3).map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[11px] leading-relaxed text-white/40">
              Ejemplo para un perfil intermedio, agresivo desde el fondo, que busca efecto en tierra batida.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
