import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-night text-cream" aria-labelledby="finder-title">
      <div className="absolute inset-0">
        <BackgroundVideo base={videos.aerialServe.base} label={videos.aerialServe.label} className="opacity-70" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,rgba(13,34,25,0.55),rgba(13,34,25,0.92))]" />
      <div className="relative mx-auto max-w-5xl px-5 py-32 text-center">
        <h2 id="finder-title" className="font-serif text-[clamp(3rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.03em]">
          <WordReveal text={"¿Qué raqueta\njuega como tú?"} />
        </h2>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-10 max-w-xl text-[19px] leading-relaxed text-cream/80">
            Once preguntas sobre tu nivel, tu golpe y lo que sientes en la pista. El Racket Finder las cruza con las especificaciones
            verificadas y te explica por qué te propone cada raqueta.
          </p>
          <Link href="/racket-finder" className="group mt-10 inline-flex items-center gap-0.5 text-[19px] font-medium text-cream hover:text-gold">
            Empezar, son tres minutos <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="mx-auto mt-16 max-w-md border-t border-cream/15 pt-6 text-[13px] leading-relaxed text-cream/55">
            Un cálculo real: para un jugador intermedio que ataca desde el fondo y busca efecto en tierra batida, el primer resultado es la{" "}
            <Link href={`/raquetas/${best.racket.slug}`} className="text-cream underline-offset-4 hover:underline">
              {brands[best.racket.brand].name} {best.racket.model} {best.racket.generation}
            </Link>
            , con un {best.compatibility} % de compatibilidad.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
