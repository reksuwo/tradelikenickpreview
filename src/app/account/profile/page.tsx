import type { Metadata } from "next";
import Link from "next/link";
import { AccountField, AccountForm } from "@/components/account/account-form";
import { PageHeading, Panel } from "@/components/account/account-ui";
import { Avatar } from "@/components/account/avatar";
import { updateProfile } from "@/lib/auth-actions";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = { title: "Profile — TradeLikeNick" };

export default async function ProfilePage() {
  const member = await requireMember("/account/profile");

  return (
    <>
      <PageHeading title="Profile" intro="How you appear across TradeLikeNick." />

      <div className="space-y-6">
        <section className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
          <Avatar name={member.fullName} src={member.avatarUrl} className="size-16 rounded-2xl text-[22px] sm:size-20 sm:text-[26px]" />
          <div className="min-w-0">
            <p className="truncate text-[20px] font-extrabold text-white">{member.fullName}</p>
            <p className="truncate text-[14px] text-white/55">{member.email}</p>
            <p className="mt-1.5 text-[13px] text-white/40">Member since {member.joined}</p>
          </div>
        </section>

        <Panel title="Personal details">
          <AccountForm action={updateProfile} submitLabel="Save changes" pendingLabel="Saving…">
            <AccountField label="Full name" name="name" defaultValue={member.fullName} autoComplete="name" />
            <AccountField
              label="Email"
              name="email"
              defaultValue={member.email}
              readOnly
              hint={
                <>
                  Used to sign in. Manage it in{" "}
                  <Link href="/account/settings" className="font-semibold text-white/75 underline-offset-2 hover:underline">
                    account settings
                  </Link>
                  .
                </>
              }
            />
          </AccountForm>
        </Panel>
      </div>
    </>
  );
}
