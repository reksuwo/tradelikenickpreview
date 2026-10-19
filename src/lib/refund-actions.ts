"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/admin-actions";
import { listPurchases, markRefunded, selfRefundCheck } from "@/lib/purchases";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/supabase/server";

/**
 * A member refunding one of their own orders from Purchases & billing. The
 * money goes back to their card through Stripe and the title leaves their
 * library straight away. Server Actions can be called by anyone with a POST,
 * so every rule is checked again here, not just in the page.
 */
export async function requestRefund(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getUser();
  if (!user) return { error: "Sign in again to refund this order." };

  const id = formData.get("purchaseId");
  const orders = await listPurchases(user.id);
  const order = orders.find((o) => o.id === id);
  if (!order) return { error: "That order doesn't exist." };

  const check = selfRefundCheck(order, orders);
  if (!check.ok) return { error: check.reason };

  try {
    await stripe().refunds.create(
      {
        payment_intent: order.paymentIntent!,
        reason: "requested_by_customer",
        metadata: { requested_by: "customer", user_id: user.id, purchase_id: order.id },
      },
      // A double click sends one refund, not two.
      { idempotencyKey: `self-refund-${order.id}` },
    );
    await markRefunded(order.paymentIntent!);
  } catch (error) {
    console.error("self-serve refund failed", error);
    return { error: "We couldn't process the refund right now. Try again in a moment, or email support." };
  }

  revalidatePath("/account", "layout");
  revalidatePath("/browse", "layout");
  return { message: "Refunded. The money goes back to your card in 5–10 business days." };
}
