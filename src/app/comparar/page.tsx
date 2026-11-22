import type { Metadata } from "next";
import { CompareView } from "@/components/compare/CompareView";

export const metadata: Metadata = {
  title: "Comparador de raquetas de tenis",
  description: "Compara hasta tres raquetas de tenis: peso, balance, cabeza, rigidez, swingweight, patrón de encordado y precio.",
  alternates: { canonical: "/comparar" },
};

export default function ComparePage() {
  return (
    <>
      <section className="container-rl pb-10 pt-32 md:pt-40">
        <p className="eyebrow">Comparador</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,7vw,6rem)]">Comparador de raquetas.</h1>
        <p className="mt-5 max-w-xl text-lg text-ink/60">Hasta tres raquetas, lado a lado: fotos reales y especificaciones verificadas.</p>
      </section>
      <CompareView />
    </>
  );
}
