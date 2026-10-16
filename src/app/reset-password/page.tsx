import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { updatePassword } from "@/lib/auth-actions";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password — TradeLikeNick",
};

/** Reached from the reset email: the callback route has already signed the user in. */
export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) redirect("/forgot-password");

  return (
    <AuthShell title="Choose a new password" intro={<>For {user.email}</>}>
      <div className="mt-8" />
      <AuthForm action={updatePassword} submitLabel="Save password" pendingLabel="Saving…">
        <PasswordField label="New password" />
      </AuthForm>
    </AuthShell>
  );
}
