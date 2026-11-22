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
    links: brandList.map((b) => ({ href: `/marcas/${b.id}`, label: `Raquetas ${b.name}` })),
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
    <footer className="overflow-hidden bg-night text-[13px] text-paper/55">
      <div className="container-rl grid gap-10 pb-16 pt-20 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo inverted />
          <p className="mt-5 leading-relaxed">
            Raquetas de tenis seleccionadas por sus especificaciones, no por su marketing. España y Unión Europea.
          </p>
          <p className="mt-4">
            Redes sociales: perfiles en preparación. Mientras tanto, escríbenos desde{" "}
            <Link href="/contacto" className="text-paper hover:underline">
              contacto
            </Link>
            .
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-silver">{c.title}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p aria-hidden className="select-none whitespace-nowrap px-3 text-center text-[clamp(4rem,17.5vw,19rem)] font-semibold leading-[0.8] tracking-[-0.06em] text-paper/[0.07]">
        RACKET <span className="font-serif font-normal italic">Lab</span>
      </p>
      <div className="container-rl">
        <div className="flex flex-col gap-2 border-t border-paper/10 py-6 text-[12px] md:flex-row md:justify-between">
          <p>© RACKET LAB. Precios en EUR, IVA incluido.</p>
          <p>Las marcas y modelos mencionados pertenecen a sus respectivos titulares.</p>
        </div>
      </div>
    </footer>
  );
}
