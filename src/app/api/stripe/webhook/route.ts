import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { recordPurchase } from "@/lib/purchases";
import { stripe } from "@/lib/stripe";

/**
 * Stripe calls this when a payment finishes. The signature check proves the
 * request came from Stripe, so it needs the raw, unparsed body.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Missing webhook secret or signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      // A failure here returns 500, and Stripe retries the event later.
      await recordPurchase(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
