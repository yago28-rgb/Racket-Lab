import { NextResponse } from "next/server";
import { priceCart } from "@/lib/pricing";
import { getStripe, stripeMode } from "@/lib/stripe";
import { shippingConfig, type ShippingZone } from "@/lib/shipping";

interface Body {
  lines: { racketId: string; grip: string; stringing: boolean; quantity: number }[];
  zone: ShippingZone;
  customer: { email: string; name: string; address: string; city: string; postalCode: string };
}

const GRIPS = new Set(["L1", "L2", "L3", "L4", "L5"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(b: unknown): { ok: true; body: Body } | { ok: false; error: string } {
  if (!b || typeof b !== "object") return { ok: false, error: "Solicitud no válida." };
  const body = b as Body;
  if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > 20) return { ok: false, error: "El carrito está vacío." };
  if (!(body.zone in shippingConfig.zones)) return { ok: false, error: "Zona de envío no válida." };
  for (const l of body.lines) {
    if (typeof l.racketId !== "string" || !GRIPS.has(l.grip) || typeof l.stringing !== "boolean" || !Number.isInteger(l.quantity)) {
      return { ok: false, error: "Línea de pedido no válida." };
    }
  }
  const c = body.customer;
  if (!c || !EMAIL.test(c.email ?? "") || !c.name?.trim() || !c.address?.trim() || !c.city?.trim() || !/^\d{4,6}$/.test(c.postalCode ?? "")) {
    return { ok: false, error: "Revisa los datos de envío." };
  }
  return { ok: true, body };
}

/**
 * Creates a payment. Prices are recomputed on the server from the catalogue;
 * anything sent by the client other than ids, grips and quantities is ignored.
 */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON no válido." }, { status: 400 });
  }
  const v = validate(json);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const { lines, zone, customer } = v.body;

  const totals = priceCart(lines, zone);
  if (totals.invalid.length) {
    return NextResponse.json({ error: "Algún producto ya no está disponible o no tiene precio confirmado. Revisa tu carrito." }, { status: 409 });
  }

  const orderId = `RL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const stripe = getStripe();

  if (!stripe) {
    // DEMO mode: no credentials configured → no payment is attempted.
    return NextResponse.json({
      mode: "demo",
      orderId,
      totals: { subtotal: totals.subtotal, shipping: totals.shipping, total: totals.total },
      lines: totals.lines.map((l) => ({ racketId: l.racket.id, name: l.name, grip: l.grip, stringing: l.stringing, quantity: l.quantity, unitPrice: l.unitPrice })),
    });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customer.email,
    locale: "es",
    client_reference_id: orderId,
    metadata: {
      orderId,
      zone,
      name: customer.name.slice(0, 200),
      address: `${customer.address}, ${customer.postalCode} ${customer.city}`.slice(0, 450),
    },
    line_items: [
      ...totals.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(l.unitPrice * 100),
          product_data: {
            name: `${l.name} ${l.racket.generation}`,
            description: `Empuñadura ${l.grip} · ${l.stringing ? "encordada" : "sin encordar"}`,
            metadata: { racketId: l.racket.id },
          },
        },
      })),
      ...(totals.shipping > 0
        ? [{ quantity: 1, price_data: { currency: "eur", unit_amount: Math.round(totals.shipping * 100), product_data: { name: `Envío · ${shippingConfig.zones[zone].label}` } } }]
        : []),
    ],
    success_url: `${origin}/checkout/confirmacion?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?cancelled=1`,
  });

  return NextResponse.json({ mode: stripeMode(), orderId, url: session.url, sessionId: session.id,
    totals: { subtotal: totals.subtotal, shipping: totals.shipping, total: totals.total },
    lines: totals.lines.map((l) => ({ racketId: l.racket.id, name: l.name, grip: l.grip, stringing: l.stringing, quantity: l.quantity, unitPrice: l.unitPrice })),
  });
}
