import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { brandList } from "@/data/brands";

const cols = [
  {
    title: "Tienda",
    links: [
      { href: "/raquetas", label: "Catálogo" },
      { href: "/racket-finder", label: "Racket Finder" },
      { href: "/comparar", label: "Comparador" },
      { href: "/carrito", label: "Carrito" },
      { href: "/pedidos", label: "Mis pedidos" },
    ],
  },
  {
    title: "Marcas",
    links: brandList.map((b) => ({ href: `/raquetas?brand=${b.id}`, label: b.name })),
  },
  {
    title: "Ayuda",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/envios", label: "Envíos y devoluciones" },
      { href: "/privacidad", label: "Política de privacidad" },
      { href: "/creditos", label: "Créditos de imágenes y vídeo" },
      { href: "/#tecnologia", label: "Guía técnica" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-club text-cream">
      <div className="container-rl grid gap-12 py-20 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo inverted />
          <p className="mt-6 font-serif text-xl italic leading-snug text-cream/85">
            Raquetas de tenis seleccionadas por sus especificaciones, no por su marketing. España y Unión Europea.
          </p>
          <p className="mt-6 text-xs text-cream/50">
            Redes sociales: perfiles en preparación. Mientras tanto, escríbenos desde{" "}
            <Link href="/contacto" className="underline underline-offset-4 hover:text-gold">
              contacto
            </Link>
            .
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="font-serif text-lg italic text-gold">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/65 transition-colors hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-cream/10">
        <div className="container-rl flex flex-col gap-2 py-6 text-xs text-cream/45 md:flex-row md:justify-between">
          <p>© RACKET LAB. Precios en EUR, IVA incluido.</p>
          <p>Las marcas y modelos mencionados pertenecen a sus respectivos titulares.</p>
        </div>
      </div>
    </footer>
  );
}
