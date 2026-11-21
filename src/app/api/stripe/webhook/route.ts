import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook. Verifies the signature and records paid orders.
 * Persistence is intentionally left as a single hook (`persistOrder`) so a
 * database (e.g. Supabase/Postgres) can be connected without touching the flow.
 */
async function persistOrder(event: { orderId: string | null; email: string | null; amountTotal: number | null; sessionId: string }) {
  // TODO(database): insert into `orders`. Logged for now so the flow is observable.
  console.info("[order.paid]", JSON.stringify(event));
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Webhook no configurado." }, { status: 501 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Falta la firma." }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: "Firma no válida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    if (s.payment_status === "paid") {
      await persistOrder({ orderId: s.client_reference_id, email: s.customer_details?.email ?? null, amountTotal: s.amount_total, sessionId: s.id });
    }
  }
  return NextResponse.json({ received: true });
}
