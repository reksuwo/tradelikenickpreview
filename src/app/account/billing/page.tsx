import type { Metadata } from "next";
import Link from "next/link";
import { iconFor } from "@/components/account/account-links";
import { EmptyState, PageHeading, Panel } from "@/components/account/account-ui";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { Pagination, SearchBox } from "@/components/admin/admin-ui";
import { LEGAL_EMAIL } from "@/lib/legal";
import { listPurchases, recordPurchase, refundDeadline, REFUND_DAYS, selfRefundCheck } from "@/lib/purchases";
import { requestRefund } from "@/lib/refund-actions";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Purchases & billing — TradeLikeNick" };

type Notice = {
  tone: "success" | "pending";
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

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
      const course = session.metadata.product_type === "course";
      return {
        tone: "success",
        title: "Payment received",
        body: `${title} is now in your library. A receipt is on its way to your email.`,
        cta: course
          ? { label: "Start watching", href: `/browse/watch/${session.metadata.product_id}` }
          : { label: "Go to My Books", href: "/account/books" },
      };
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

const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const PAGE_SIZE = 10;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getUser();
  if (!user) return null; // The account layout already sends signed-out visitors to sign in.

  const { session_id, q: rawQuery, page: rawPage } = await searchParams;
  const notice = typeof session_id === "string" ? await confirmCheckout(session_id, user.id) : null;
  const purchases = await listPurchases(user.id);

  // Search and page in memory: one member's orders are few, and the refund
  // rules below need all of them anyway.
  const q = typeof rawQuery === "string" ? rawQuery.trim() : "";
  const term = q.toLowerCase();
  const matches = term
    ? purchases.filter((p) =>
        `${p.title} ${p.productType === "course" ? "course" : "trading book"}`.toLowerCase().includes(term),
      )
    : purchases;
  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(typeof rawPage === "string" ? rawPage : "", 10) || 1));
  const shown = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // Links keep the search but drop session_id, so the payment notice doesn't come back.
  const params = { q: q || undefined };

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
            {notice.cta ? (
              <Link
                href={notice.cta.href}
                className="mt-4 inline-block rounded-full bg-neon px-5 py-2.5 text-[14px] font-bold text-ink transition-opacity hover:opacity-90"
              >
                {notice.cta.label}
              </Link>
            ) : null}
          </div>
        ) : null}

        {purchases.length ? (
          <Panel
            title="Orders"
            description={`Receipts are emailed by Stripe when you pay. Changed your mind? Refund any order within ${REFUND_DAYS} days.`}
          >
            <div className="mb-5">
              <SearchBox base="/account/billing" params={params} placeholder="Search your orders" />
            </div>

            {shown.length ? null : (
              <p className="py-6 text-center text-[14px] text-white/50">
                No orders match &ldquo;{q}&rdquo;.{" "}
                <Link href="/account/billing" className="font-semibold text-white/75 hover:underline">
                  Show all orders
                </Link>
              </p>
            )}

            <ul className="divide-y divide-white/10">
              {shown.map((p) => {
                const refund = selfRefundCheck(p, purchases);
                // Inside the window but past the self-serve limits: point them to a person.
                const askSupport =
                  !refund.ok && p.source === "stripe" && !p.refundedAt && new Date() <= refundDeadline(p);
                return (
                  <li key={p.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={p.productType === "course" ? "/account/courses" : "/account/books"}
                          className="block truncate text-[15px] font-semibold text-white hover:underline"
                        >
                          {p.title}
                        </Link>
                        <p className="mt-0.5 text-[13px] text-white/50">
                          {p.productType === "course" ? "Course" : "Trading book"} · {shortDate(p.createdAt)}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-[15px] font-bold tabnum text-white">
                        {p.source === "grant" ? "Complimentary" : formatMoney(p.amountCents, p.currency)}
                        {p.refundedAt ? (
                          <span className="block text-[12.5px] font-semibold text-white/50">Refunded</span>
                        ) : null}
                      </p>
                    </div>

                    {refund.ok ? (
                      <ActionForm
                        action={requestRefund}
                        confirm={`Refund ${formatMoney(p.amountCents, p.currency)} for ${p.title}? It leaves your library straight away and the money goes back to your card.`}
                        className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5"
                        noticeClassName="basis-full"
                      >
                        <input type="hidden" name="purchaseId" value={p.id} />
                        <span className="text-[12.5px] text-white/45">Refundable until {shortDate(refundDeadline(p))}</span>
                        <Submit
                          pending="Refunding…"
                          className="rounded-full px-3 py-1 text-[12.5px] font-semibold text-[#ff9384] ring-1 ring-[#ff6b5a]/50 transition-colors hover:bg-[#ff6b5a]/15 hover:text-[#ffb3a8] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Refund
                        </Submit>
                      </ActionForm>
                    ) : askSupport ? (
                      <p className="mt-2 text-[12.5px] text-white/45">
                        To refund this order, email{" "}
                        <a href={`mailto:${LEGAL_EMAIL}`} className="font-semibold text-white/70 underline-offset-2 hover:underline">
                          {LEGAL_EMAIL}
                        </a>{" "}
                        by {shortDate(refundDeadline(p))}.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {matches.length > PAGE_SIZE ? (
              // Pagination brings its own side padding; pull it out to the panel's edge so it lines up.
              <div className="-mx-5 -mb-5 mt-3 border-t border-white/10 sm:-mx-6 sm:-mb-7">
                <Pagination base="/account/billing" params={params} page={page} total={matches.length} pageSize={PAGE_SIZE} />
              </div>
            ) : null}
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
