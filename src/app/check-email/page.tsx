import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResendButton } from "@/components/auth/resend-button";
import { readPendingSignup } from "@/lib/pending-signup";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Check your email — TradeLikeNick",
};

const TIPS = [
  "Look in your spam, junk or promotions folder.",
  "Search your inbox for “TradeLikeNick” or “Confirm your signup”.",
  "Open the link on this device and browser to go straight to your library.",
];

/** Shown right after sign-up while the confirmation email is on its way. */
export default async function CheckEmailPage() {
  if (await getUser()) redirect("/browse");
  const pending = await readPendingSignup();
  if (!pending) redirect("/signup");

  return (
    <AuthShell>
      <div className="flex items-center gap-4">
        <div
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-ink ring-1 ring-accent/30"
        >
          <svg viewBox="0 0 24 24" className="size-6">
            <rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.8 6.5l8.2 6.2 8.2-6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-[clamp(1.9rem,3.4vw,2.4rem)] font-extrabold leading-[1.06] text-fg">
          Check your email
        </h1>
      </div>
      <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
        We sent a confirmation link to{" "}
        <span className="break-all font-semibold text-fg">{pending.email}</span>. Click it to
        activate your account and start watching.
      </p>

      <div className="mt-8 rounded-2xl border border-edge bg-card p-5">
        <p className="text-[13.5px] font-semibold text-fg">Can&apos;t find it?</p>
        <ul className="mt-3 space-y-2.5">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2.5 text-[14px] leading-relaxed text-muted">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <ResendButton />
      </div>

      <p className="mt-7 text-[14px] text-muted">
        Wrong email?{" "}
        <Link
          href="/signup"
          className="font-semibold text-fg underline decoration-accent decoration-[3px] underline-offset-4"
        >
          Sign up again
        </Link>{" "}
        · Already confirmed?{" "}
        <Link
          href="/signin"
          className="font-semibold text-fg underline decoration-accent decoration-[3px] underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
