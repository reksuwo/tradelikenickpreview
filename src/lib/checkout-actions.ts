"use server";

import { findProduct } from "@/lib/products";
import { ownsProduct } from "@/lib/purchases";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/supabase/server";

export type CheckoutStart = { clientSecret: string } | { signIn: true } | { error: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Opens a Stripe Checkout Session for one course or book. The browser only
 * says which item; the price comes from the catalogue here on the server.
 */
export async function startCheckout(ref: unknown): Promise<CheckoutStart> {
  const product = findProduct(ref);
  if (!product) return { error: "This item isn't available to buy." };

  const user = await getUser();
  if (!user) return { signIn: true };

  try {
    if (await ownsProduct(user.id, product)) {
      return { error: "You already own this. You'll find it in your account." };
    }

    const session = await stripe().checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: product.cents,
            product_data: { name: product.title, description: product.description },
          },
        },
      ],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        product_type: product.type,
        product_id: product.id,
        title: product.title,
      },
      return_url: `${SITE_URL}/account/billing?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.client_secret) throw new Error("Checkout Session has no client secret");
    return { clientSecret: session.client_secret };
  } catch (error) {
    console.error("startCheckout failed", error);
    return { error: "We couldn't start checkout. Try again in a moment." };
  }
}
