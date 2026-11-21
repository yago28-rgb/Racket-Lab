import "server-only";
import Stripe from "stripe";

/**
 * Returns a Stripe client when STRIPE_SECRET_KEY is configured, otherwise null.
 * Without a key the checkout runs in an explicit DEMO mode: no payment is taken
 * and the UI says so. Use a `sk_test_…` key to try real Stripe Checkout in test mode.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function stripeMode(): "live" | "test" | "demo" {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return "demo";
  return key.startsWith("sk_live_") ? "live" : "test";
}
