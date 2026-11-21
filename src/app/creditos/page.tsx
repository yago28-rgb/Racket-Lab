import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/Prose";
import { credits } from "@/data/credits";

export const metadata: Metadata = { title: "Créditos de imágenes y vídeo", alternates: { canonical: "/creditos" } };

export default function CreditsPage() {
  return (
    <LegalPage eyebrow="Créditos" title="Imágenes y vídeo.">
      <p>
        <strong>Fotografías de producto.</strong> Las fotos de las raquetas pertenecen a sus fabricantes o a las tiendas de donde se han
        guardado. Se usan solo en local, en la copia privada de esta tienda: la carpeta <code>public/fotos/</code> está excluida del repositorio
        y no se publica.
      </p>
      <h2>Recursos de terceros</h2>
      <ul className="!ml-0 space-y-6">
        {credits.map((c) => (
          <li key={c.url} className="!ml-0 list-none border-t border-line pt-5">
            <p className="font-medium text-ink">{c.asset}</p>
            <p className="text-sm">
              {c.author} ·{" "}
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {c.source}
              </a>{" "}
              ·{" "}
              <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {c.license}
              </a>
            </p>
            <p className="text-sm text-muted">
              Uso: {c.usedIn}
              {c.notes ? `. ${c.notes}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
