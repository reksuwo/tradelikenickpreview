import type { Metadata } from "next";
import Link from "next/link";
import { iconFor } from "@/components/account/account-links";
import { EmptyState, PageHeading, Panel } from "@/components/account/account-ui";
import { listPurchases, recordPurchase } from "@/lib/purchases";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Purchases & billing — TradeLikeNick" };

type Notice = { tone: "success" | "pending"; title: string; body: string };

/**
 * Stripe sends buyers here with ?session_id= after checkout. Record the order
 * straight away rather than waiting for the webhook, so it shows on arrival.
 */
async function confirmCheckout(sessionId: string, userId: string): Promise<Notice | null> {
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.user_id !== userId) return null;

    const title = session.metadata.title ?? "Your purchase";
    if (await recordPurchase(session)) {
      return { tone: "success", title: "Payment received", body: `${title} is now in your library. A receipt is on its way to your email.` };
    }
    return {
      tone: "pending",
      title: "Payment processing",
      body: `We'll unlock ${title} as soon as your payment clears. It will then appear in your orders below.`,
    };
  } catch (error) {
    console.error("confirmCheckout failed", error);
    return null;
  }
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getUser();
  if (!user) return null; // The account layout already sends signed-out visitors to sign in.

  const { session_id } = await searchParams;
  const notice = typeof session_id === "string" ? await confirmCheckout(session_id, user.id) : null;
  const purchases = await listPurchases(user.id);

  return (
    <>
      <PageHeading title="Purchases & billing" intro="Your orders, receipts and payment details." />

      <div className="space-y-6">
        {notice ? (
          <div
            role="status"
            className={`rounded-2xl border p-5 sm:p-6 ${
              notice.tone === "success" ? "border-neon/40 bg-neon/10" : "border-white/15 bg-white/[0.04]"
            }`}
          >
            <p className="text-[16px] font-bold text-white">{notice.title}</p>
            <p className="mt-1 text-[14.5px] leading-relaxed text-white/70">{notice.body}</p>
          </div>
        ) : null}

        {purchases.length ? (
          <Panel title="Orders" description="Receipts are emailed by Stripe when you pay.">
            <ul className="divide-y divide-white/10">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link
                      href={p.productType === "course" ? "/account/courses" : "/account/books"}
                      className="block truncate text-[15px] font-semibold text-white hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-[13px] text-white/50">
                      {p.productType === "course" ? "Course" : "Trading book"} ·{" "}
                      {p.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <p className="shrink-0 text-[15px] font-bold tabnum text-white">
                    {formatMoney(p.amountCents, p.currency)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        ) : (
          <EmptyState
            icon={iconFor("/account/billing")}
            title="No purchases yet"
            body="When you buy a course or book, the order and its receipt will appear here."
            cta={{ label: "Browse courses", href: "/browse/courses" }}
          />
        )}

        <Panel title="Payment method" description="Cards are handled by Stripe, our payment provider, and never stored on our servers.">
          <p className="text-[14.5px] text-white/60">You enter your card at checkout each time you buy.</p>
        </Panel>
      </div>
    </>
  );
}
