import "server-only";
import type Stripe from "stripe";
import { db } from "./db";
import type { ProductRef } from "./products";

export type Purchase = {
  id: string;
  productType: ProductRef["type"];
  productId: string;
  title: string;
  amountCents: number;
  currency: string;
  createdAt: Date;
};

/**
 * Records a paid Checkout Session. Both the webhook and the return page call
 * this, so it ignores sessions it has already stored. Returns true once the
 * purchase is on record.
 */
export async function recordPurchase(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return false;

  const { user_id, product_type, product_id, title } = session.metadata ?? {};
  if (!user_id || !product_type || !product_id) return false;

  const paymentIntent =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  await db`
    insert into public.purchases ${db({
      user_id,
      product_type,
      product_id,
      title: title ?? product_id,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      stripe_session_id: session.id,
      stripe_payment_intent: paymentIntent,
    })}
    on conflict (stripe_session_id) do nothing
  `;
  return true;
}

export async function ownsProduct(userId: string, { type, id }: ProductRef) {
  const rows = await db`
    select 1 from public.purchases
    where user_id = ${userId} and product_type = ${type} and product_id = ${id}
    limit 1
  `;
  return rows.length > 0;
}

/** A member's orders, newest first. */
export async function listPurchases(userId: string): Promise<Purchase[]> {
  return db<Purchase[]>`
    select id, product_type as "productType", product_id as "productId", title,
           amount_cents as "amountCents", currency, created_at as "createdAt"
    from public.purchases
    where user_id = ${userId}
    order by created_at desc
  `;
}
