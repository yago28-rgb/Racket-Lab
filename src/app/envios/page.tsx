import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/Prose";
import { shippingConfig } from "@/lib/shipping";
import { formatEUR } from "@/lib/format";

export const metadata: Metadata = { title: "Envíos y devoluciones", alternates: { canonical: "/envios" } };

export default function ShippingPage() {
  const z = shippingConfig.zones;
  return (
    <LegalPage eyebrow="Ayuda" title="Envíos y devoluciones.">
      <h2>Envíos</h2>
      <ul>
        {Object.values(z).map((zone) => (
          <li key={zone.label}>
            <strong>{zone.label}:</strong> {formatEUR(zone.cost)} · gratis desde {formatEUR(zone.freeFrom)} · plazo estimado {zone.eta}.
          </li>
        ))}
      </ul>
      <p>
        Las raquetas se envían sin encordar salvo que añadas el servicio de {shippingConfig.stringingService.label.toLowerCase()} (
        {formatEUR(shippingConfig.stringingService.price)}). En ese caso te contactamos para acordar cuerda y tensión antes del envío.
      </p>
      <h2>Desistimiento y devoluciones</h2>
      <p>
        Como consumidor en la Unión Europea dispones de 14 días naturales desde la recepción para desistir de la compra sin indicar el motivo
        (Directiva 2011/83/UE). La raqueta debe devolverse sin uso, con su embalaje y protector originales. Una raqueta encordada a petición
        del cliente puede considerarse personalizada; consúltanos antes de devolverla.
      </p>
      <p className="text-sm text-muted">
        Texto informativo pendiente de revisión legal antes de la puesta en producción.
      </p>
    </LegalPage>
  );
}
