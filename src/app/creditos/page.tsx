import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/Prose";
import { credits } from "@/data/credits";

export const metadata: Metadata = { title: "Créditos de imágenes y 3D", alternates: { canonical: "/creditos" } };

export default function CreditsPage() {
  return (
    <LegalPage eyebrow="Créditos" title="Imágenes, vídeo y 3D.">
      <p>
        <strong>Productos.</strong> Las imágenes y modelos 3D de las raquetas son <strong>renders representativos</strong> generados por RACKET LAB
        en Blender a partir de las especificaciones publicadas de cada modelo (tamaño de cabeza, perfil, longitud y patrón de encordado). Los
        colores son aproximados y no incluyen logotipos: no son fotografías ni reproducciones exactas de los productos de los fabricantes.
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
