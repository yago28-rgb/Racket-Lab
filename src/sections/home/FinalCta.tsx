import { ButtonLink } from "@/components/ui/Button";
import { Reveal, WordReveal } from "@/components/ui/Reveal";

export function FinalCta() {
  return (
    <section className="studio-bg py-32 md:py-44" aria-labelledby="cta-title">
      <div className="container-rl text-center">
        <h2 id="cta-title" className="display mx-auto max-w-4xl text-[clamp(2.8rem,7.5vw,7rem)]">
          <WordReveal text={"Play your game.\nNot someone else's."} />
        </h2>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-8 max-w-md text-lg text-ink/60">Tres minutos. Once preguntas. Una recomendación que puedes entender.</p>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/racket-finder" size="lg">
              Find your racket
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
