import type { Metadata } from "next";
import { FinderFlow } from "@/components/finder/FinderFlow";
import { PhotoHeader } from "@/components/ui/PhotoHeader";

export const metadata: Metadata = {
  title: "Racket Finder: qué raqueta de tenis comprar según tu juego",
  description:
    "Encuentra tu raqueta de tenis ideal: 11 preguntas sobre tu nivel, estilo y sensaciones, y una recomendación explicada calculada con especificaciones verificadas.",
  alternates: { canonical: "/racket-finder" },
};

export default function RacketFinderPage() {
  return (
    <div>
      <PhotoHeader src="/media/video/hero-stadium-poster.webp" alt="Jugador sacando en una pista de estadio" position="30% 30%">
        <div className="pb-14 pt-36 md:pb-20 md:pt-48">
          <p className="eyebrow !text-white/60">Racket Finder</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,6vw,5rem)]">
            ¿Qué raqueta de tenis comprar?
            <br />
            <span className="text-white/55">La que juega como tú.</span>
          </h1>
        </div>
      </PhotoHeader>
      <FinderFlow />
    </div>
  );
}
