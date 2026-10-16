import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading, Panel } from "@/components/account/account-ui";
import { FAQS } from "@/lib/faqs";

export const metadata: Metadata = { title: "Help & support — TradeLikeNick" };

const SUPPORT_EMAIL = "hello@tradelikenick.com";

export default function HelpPage() {
  return (
    <>
      <PageHeading title="Help & support" intro="Answers to common questions, or a way to reach us." />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25 sm:p-6"
          >
            <span className="block text-[16px] font-bold text-white">Email support</span>
            <span className="mt-1.5 block text-[14px] leading-relaxed text-white/55">
              {SUPPORT_EMAIL}. A person replies within a day.
            </span>
          </a>
          <Link
            href="/account/settings"
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/25 sm:p-6"
          >
            <span className="block text-[16px] font-bold text-white">Password and sign-in</span>
            <span className="mt-1.5 block text-[14px] leading-relaxed text-white/55">
              Change your password or sign out of other devices.
            </span>
          </Link>
        </div>

        <Panel title="Frequently asked questions">
          <div className="divide-y divide-white/10 border-y border-white/10">
            {FAQS.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0 text-white/50 transition-transform group-open:rotate-45">
                    <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="pb-4 pr-8 text-[14.5px] leading-relaxed text-white/60">{f.a}</p>
              </details>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
