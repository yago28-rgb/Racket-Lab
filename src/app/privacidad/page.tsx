import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/Prose";

export const metadata: Metadata = { title: "Política de privacidad", alternates: { canonical: "/privacidad" } };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacidad.">
      <p>
        Resumen de cómo trata RACKET LAB tus datos, conforme al Reglamento General de Protección de Datos (RGPD). Los datos identificativos del
        responsable se completarán antes de la puesta en producción.
      </p>
      <h2>Qué datos tratamos</h2>
      <ul>
        <li>
          <strong>Pedidos:</strong> nombre, email y dirección de envío, para gestionar la compra y la entrega.
        </li>
        <li>
          <strong>Pagos:</strong> los procesa Stripe. RACKET LAB no recibe ni almacena los datos de tu tarjeta.
        </li>
        <li>
          <strong>Contacto:</strong> nombre, email y mensaje, para responder a tu consulta.
        </li>
      </ul>
      <h2>Racket Finder</h2>
      <p>
        Las respuestas del cuestionario —incluidas la edad y las molestias físicas, ambas opcionales— se procesan en tu navegador y se guardan
        únicamente en su almacenamiento local para que puedas retomar el test. No se envían a nuestros servidores.
      </p>
      <h2>Almacenamiento local</h2>
      <p>
        Usamos el almacenamiento local del navegador para el carrito, el comparador, el historial de pedidos de demostración y el Racket Finder.
        No usamos cookies de publicidad ni de seguimiento de terceros.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiéndonos desde la página de
        contacto, y reclamar ante la Agencia Española de Protección de Datos.
      </p>
      <p className="text-sm text-muted">Texto informativo pendiente de revisión legal antes de la puesta en producción.</p>
    </LegalPage>
  );
}
