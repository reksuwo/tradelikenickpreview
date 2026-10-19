import "server-only";
import { cache } from "react";
import type Stripe from "stripe";
import { getAllCourses } from "./course-store";
import { db } from "./db";
import { notify } from "./notifications";
import type { ProductRef } from "./products";
import { getUser } from "./supabase/server";

export type Purchase = {
  id: string;
  productType: ProductRef["type"];
  productId: string;
  title: string;
  amountCents: number;
  currency: string;
  /** "grant" when an admin gave access without a payment. */
  source: "stripe" | "grant";
  /** The Stripe payment a refund goes back to; null for grants. */
  paymentIntent: string | null;
  refundedAt: Date | null;
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

  const inserted = await db`
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
    returning id
  `;

  // Only the first of the two callers gets a row back, so this sends once.
  if (inserted.length > 0) {
    const isCourse = product_type === "course";
    try {
      await notify(user_id, {
        kind: "purchase",
        title: `${title ?? product_id} is unlocked`,
        body: isCourse ? "Start watching whenever you're ready." : "Your download is ready in My Books.",
        href: isCourse ? `/browse/watch/${product_id}` : "/account/books",
      });
    } catch (error) {
      // The purchase is safely on record; a missed notification shouldn't fail it.
      console.error("purchase notification failed", error);
    }
  }
  return true;
}

export async function ownsProduct(userId: string, { type, id }: ProductRef) {
  const rows = await db`
    select 1 from public.purchases
    where user_id = ${userId} and product_type = ${type} and product_id = ${id} and refunded_at is null
    limit 1
  `;
  return rows.length > 0;
}

/** Ids the signed-in member can open. Plain arrays so pages can pass them to client components. */
export type Library = { courses: string[]; books: string[] };

/**
 * What the signed-in member owns: everything they bought, plus courses priced
 * "Included". Cached per request so a layout and its page can both ask.
 */
export const getLibrary = cache(async (): Promise<Library> => {
  const courses = new Set((await getAllCourses()).filter((c) => c.priceCents == null).map((c) => c.id));
  const books = new Set<string>();

  const user = await getUser();
  if (user) {
    try {
      const rows = await db<{ product_type: string; product_id: string }[]>`
        select distinct product_type, product_id from public.purchases
        where user_id = ${user.id} and refunded_at is null
      `;
      for (const row of rows) (row.product_type === "course" ? courses : books).add(row.product_id);
    } catch (error) {
      // Keep the pages up if the database is unreachable; purchases show again once it's back.
      console.error("getLibrary failed", error);
    }
  }

  return { courses: [...courses], books: [...books] };
});

/** A member's orders, newest first. */
export async function listPurchases(userId: string): Promise<Purchase[]> {
  return db<Purchase[]>`
    select id, product_type as "productType", product_id as "productId", title,
           amount_cents as "amountCents", currency, source, stripe_payment_intent as "paymentIntent",
           refunded_at as "refundedAt", created_at as "createdAt"
    from public.purchases
    where user_id = ${userId}
    order by created_at desc
  `;
}

/** How long after buying a member can refund it themselves (the Terms promise 30 days). */
export const REFUND_DAYS = 30;
/**
 * Self-serve refunds allowed in any 12 months. Past this, or for a title
 * already refunded once, the member emails support instead, so repeated
 * buy-and-refund cycles (which the Terms let us refuse) get a human look.
 */
const SELF_REFUNDS_PER_YEAR = 3;

const DAY = 24 * 60 * 60 * 1000;

export function refundDeadline(order: Pick<Purchase, "createdAt">) {
  return new Date(order.createdAt.getTime() + REFUND_DAYS * DAY);
}

/**
 * Whether the member can refund this order from their account. `orders` is
 * all of their orders, for the repeat-refund checks. `reason` is shown to them.
 */
export function selfRefundCheck(order: Purchase, orders: Purchase[], now = new Date()) {
  const no = (reason: string) => ({ ok: false as const, reason });

  if (order.source !== "stripe" || !order.paymentIntent) return no("This order wasn't paid by card, so it can't be refunded here.");
  if (order.refundedAt) return no("This order is already refunded.");
  if (now > refundDeadline(order)) return no(`The ${REFUND_DAYS}-day refund window for this order has ended.`);

  const refundedSameTitle = orders.some(
    (o) => o.id !== order.id && o.refundedAt && o.productType === order.productType && o.productId === order.productId,
  );
  const refundsThisYear = orders.filter((o) => o.refundedAt && now.getTime() - o.refundedAt.getTime() < 365 * DAY).length;
  if (refundedSameTitle || refundsThisYear >= SELF_REFUNDS_PER_YEAR) {
    return no("Email support to refund this order and we'll sort it out.");
  }

  return { ok: true as const };
}

/** Marks the order paid with this PaymentIntent as refunded, which takes its access away. */
export async function markRefunded(paymentIntent: string) {
  await db`
    update public.purchases set refunded_at = now()
    where stripe_payment_intent = ${paymentIntent} and refunded_at is null
  `;
}
