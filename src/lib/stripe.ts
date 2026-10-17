import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

/** Server-side Stripe client, created on first use so builds don't need the key. */
export function stripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env (see .env.example).");
    client = new Stripe(key);
  }
  return client;
}
