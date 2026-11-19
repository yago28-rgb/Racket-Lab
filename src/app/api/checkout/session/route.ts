import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/** Returns the payment status of a Stripe Checkout session (used by the confirmation page). */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const stripe = getStripe();
  if (!stripe || !id || !id.startsWith("cs_")) return NextResponse.json({ status: "unknown" }, { status: 400 });
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    return NextResponse.json({ status: s.payment_status, orderId: s.client_reference_id });
  } catch {
    return NextResponse.json({ status: "unknown" }, { status: 404 });
  }
}
