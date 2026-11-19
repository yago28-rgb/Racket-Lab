import type { Metadata } from "next";
import { FinderFlow } from "@/components/finder/FinderFlow";

export const metadata: Metadata = {
  title: "Racket Finder",
  description:
    "Encuentra tu raqueta de tenis ideal: 11 preguntas sobre tu nivel, estilo y sensaciones, y una recomendación explicada calculada con especificaciones verificadas.",
  alternates: { canonical: "/racket-finder" },
};

export default function RacketFinderPage() {
  return (
    <div className="pt-14">
      <header className="studio-bg border-b border-line">
        <div className="container-rl py-14 md:py-20">
          <p className="eyebrow">Racket Finder</p>
          <h1 className="display mt-5 text-[clamp(2.4rem,6vw,5rem)]">
            Your game has a signature.
            <br />
            <span className="text-ink/35">Let’s find your racket.</span>
          </h1>
        </div>
      </header>
      <FinderFlow />
    </div>
  );
}
