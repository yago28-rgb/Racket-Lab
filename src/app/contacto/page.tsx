import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Consultas sobre raquetas, pedidos, encordado y disponibilidad.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <section className="container-rl grid gap-16 pb-28 pt-28 md:grid-cols-2 md:pt-36">
      <div>
        <h1 className="text-[clamp(2.8rem,6vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
          Hablemos de <span className="font-serif font-normal italic tracking-[-0.01em] text-muted">tu juego.</span>
        </h1>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted">
          ¿Dudas entre dos modelos, quieres confirmar disponibilidad o necesitas ayuda con tu pedido? Escríbenos.
        </p>
        <figure className="relative mt-12 hidden aspect-[16/10] overflow-hidden rounded-[28px] md:block">
          <Image src="/media/video/hero-forehand-poster.webp" alt="Primer plano de una derecha a contraluz" fill sizes="45vw" className="object-cover" />
        </figure>
      </div>
      <Suspense fallback={null}>
        <ContactForm />
      </Suspense>
    </section>
  );
}
