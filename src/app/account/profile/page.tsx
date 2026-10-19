import type { Metadata } from "next";
import Link from "next/link";
import { AccountField, AccountForm } from "@/components/account/account-form";
import { PageHeading, Panel } from "@/components/account/account-ui";
import { ProfileCard } from "@/components/account/avatar-upload";
import { updateProfile } from "@/lib/auth-actions";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = { title: "Profile — TradeLikeNick" };

export default async function ProfilePage() {
  const member = await requireMember("/account/profile");

  return (
    <>
      <PageHeading title="Profile" intro="How you appear across TradeLikeNick." />

      <div className="space-y-6">
        <ProfileCard
          name={member.fullName}
          email={member.email}
          joined={member.joined}
          src={member.avatarUrl}
          uploaded={member.hasUploadedPhoto}
        />

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
