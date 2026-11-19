import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-night px-6 text-center text-white">
      <Image src="/media/photos/aerial-court.webp" alt="Pista de tenis vista desde arriba" fill sizes="100vw" className="object-cover opacity-60" priority />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(10,10,11,0.55),rgba(10,10,11,0.92))]" />
      <div className="relative">
        <p className="eyebrow !text-white/60">404</p>
        <h1 className="display mt-5 text-[clamp(3rem,10vw,8rem)]">Out.</h1>
        <p className="mx-auto mt-4 max-w-sm text-white/70">La bola ha salido de la pista: esta página no existe o se ha movido.</p>
        <div className="mt-10 flex justify-center gap-3">
          <ButtonLink href="/" variant="inverted">
            Inicio
          </ButtonLink>
          <ButtonLink href="/raquetas" variant="outline-inverted">
            Raquetas
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
