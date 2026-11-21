import { ButtonLink } from "@/components/ui/Button";
import { Reveal, WordReveal } from "@/components/ui/Reveal";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { videos } from "@/lib/media";
import { Magnetic } from "@/components/ui/motion-kit";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-night py-36 text-white md:py-52" aria-labelledby="cta-title">
      <div className="absolute inset-0">
        <BackgroundVideo base={videos.aerialCourt.base} label={videos.aerialCourt.label} className="opacity-70" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgba(13,34,25,0.55),rgba(13,34,25,0.9))]" />
      <div className="container-rl relative text-center">
        <h2 id="cta-title" className="display mx-auto max-w-4xl text-[clamp(2.8rem,7.5vw,7rem)]">
          <WordReveal text={"Play your game.\nNot someone else's."} />
        </h2>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-8 max-w-md text-lg text-white/70">Tres minutos. Once preguntas. Una recomendación que puedes entender.</p>
          <div className="mt-10 flex justify-center">
            <Magnetic strength={0.35}>
              <ButtonLink href="/racket-finder" size="lg" variant="inverted">
                Find your racket
              </ButtonLink>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
