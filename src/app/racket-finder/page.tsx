import type { Metadata } from "next";
import { FinderFlow } from "@/components/finder/FinderFlow";
import { PhotoHeader } from "@/components/ui/PhotoHeader";

export const metadata: Metadata = {
  title: "Racket Finder",
  description:
    "Encuentra tu raqueta de tenis ideal: 11 preguntas sobre tu nivel, estilo y sensaciones, y una recomendación explicada calculada con especificaciones verificadas.",
  alternates: { canonical: "/racket-finder" },
};

export default function RacketFinderPage() {
  return (
    <div>
      <PhotoHeader src="/media/photos/serve-sky.webp" alt="Tenista lanzando la bola en el saque, a contraluz" position="30% 30%">
        <div className="pb-14 pt-36 md:pb-20 md:pt-48">
          <p className="eyebrow !text-white/60">Racket Finder</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,6vw,5rem)]">
            Your game has a signature.
            <br />
            <span className="text-white/50">Let’s find your racket.</span>
          </h1>
        </div>
      </PhotoHeader>
      <FinderFlow />
    </div>
  );
}
