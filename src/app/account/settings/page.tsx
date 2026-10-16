import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm } from "@/components/account/account-form";
import { PageHeading, Panel } from "@/components/account/account-ui";
import { PasswordField } from "@/components/auth/password-field";
import { changePassword, signOutEverywhere } from "@/lib/auth-actions";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = { title: "Account settings — TradeLikeNick" };

export default async function SettingsPage() {
  const member = await requireMember("/account/settings");

  return (
    <>
      <PageHeading title="Account settings" intro="Sign-in details and security for your account." />

      <div className="space-y-6">
        <Panel title="Email address" description="The address you sign in with and where receipts are sent.">
          <p className="text-[15px] font-semibold text-white">{member.email}</p>
          <p className="mt-1.5 text-[13px] text-white/45">
            Need to change it?{" "}
            <Link href="/account/help" className="font-semibold text-white/75 underline-offset-2 hover:underline">
              Contact support
            </Link>
            .
          </p>
        </Panel>

        <Panel title="Password" description="At least 8 characters, with upper and lowercase letters, a number and a symbol.">
          <AccountForm action={changePassword} submitLabel="Update password" pendingLabel="Updating…">
            <PasswordField label="New password" />
          </AccountForm>
        </Panel>

        <Panel
          title="Sessions"
          description="Signed in on a shared or lost device? Sign out everywhere, including here."
        >
          <form action={signOutEverywhere}>
            <button
              type="submit"
              className="rounded-full px-5 py-2.5 text-[14px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
            >
              Sign out of all devices
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}
