import type { Metadata } from "next";
import { iconFor } from "@/components/account/account-links";
import { EmptyState, PageHeading, Panel } from "@/components/account/account-ui";

export const metadata: Metadata = { title: "Purchases & billing — TradeLikeNick" };

export default function BillingPage() {
  return (
    <>
      <PageHeading title="Purchases & billing" intro="Your orders, receipts and payment details." />

      <div className="space-y-6">
        <Panel title="Payment method" description="Cards are stored securely by our payment provider, never on our servers.">
          <p className="text-[14.5px] text-white/60">No card on file.</p>
        </Panel>

        <EmptyState
          icon={iconFor("/account/billing")}
          title="No purchases yet"
          body="When you buy a course or book, the order and its receipt will appear here."
          cta={{ label: "Browse courses", href: "/browse/courses" }}
        />
      </div>
    </>
  );
}
