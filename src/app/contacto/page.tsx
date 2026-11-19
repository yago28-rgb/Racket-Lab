import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Consultas sobre raquetas, pedidos, encordado y disponibilidad.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <section className="container-rl grid gap-16 pb-28 pt-32 md:grid-cols-2 md:pt-40">
      <div>
        <p className="eyebrow">Contacto</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">Hablemos de tu juego.</h1>
        <p className="mt-6 max-w-md text-lg text-ink/60">
          ¿Dudas entre dos modelos, quieres confirmar disponibilidad o necesitas ayuda con tu pedido? Escríbenos.
        </p>
      </div>
      <Suspense fallback={null}>
        <ContactForm />
      </Suspense>
    </section>
  );
}
