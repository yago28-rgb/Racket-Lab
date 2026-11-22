import Link from "next/link";
import { getAllRackets } from "@/lib/catalog";
import { recommend } from "@/lib/recommendation/engine";
import { emptyAnswers, type FinderAnswers } from "@/lib/recommendation/types";
import { brands } from "@/data/brands";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { WordReveal, Reveal } from "@/components/ui/Reveal";
import { videos } from "@/lib/media";

/** A real engine run for a sample profile — quoted, not mocked. */
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
  const best = recommend(getAllRackets(), sample).best!;
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-night text-white" aria-labelledby="finder-title">
      <div className="absolute inset-0">
        <BackgroundVideo base={videos.aerialServe.base} label={videos.aerialServe.label} className="opacity-70" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,rgba(0,0,0,0.45),rgba(0,0,0,0.9))]" />
      <div className="relative mx-auto max-w-5xl px-5 py-32 text-center">
        <h2 id="finder-title" className="text-[clamp(2.8rem,7vw,6.5rem)] font-semibold leading-[1] tracking-[-0.04em]">
          <WordReveal text={"¿Qué raqueta\njuega como tú?"} />
        </h2>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-8 max-w-xl text-[clamp(1.1rem,1.6vw,1.4rem)] leading-snug text-white/80">
            Once preguntas sobre tu nivel, tu golpe y lo que sientes en la pista. El Racket Finder las cruza con las especificaciones
            verificadas y te explica por qué te propone cada raqueta.
          </p>
          <Link href="/racket-finder" className="mt-10 inline-flex h-12 items-center rounded-full bg-white px-7 text-[17px] text-ink transition-colors hover:bg-white/85">
            Empezar el Racket Finder
          </Link>
          <p className="mx-auto mt-16 max-w-md border-t border-white/15 pt-6 text-[13px] leading-relaxed text-white/55">
            Un cálculo real: para un jugador intermedio que ataca desde el fondo y busca efecto en tierra batida, el primer resultado es la{" "}
            <Link href={`/raquetas/${best.racket.slug}`} className="text-white underline-offset-4 hover:underline">
              {brands[best.racket.brand].name} {best.racket.model} {best.racket.generation}
            </Link>
            , con un {best.compatibility} % de compatibilidad.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
