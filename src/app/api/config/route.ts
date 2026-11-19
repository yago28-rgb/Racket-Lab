import { NextResponse, connection } from "next/server";
import { stripeMode } from "@/lib/stripe";

/** Public, non-secret runtime config for the client (payment mode only). */
export async function GET() {
  await connection();
  return NextResponse.json({ payments: stripeMode() });
}
