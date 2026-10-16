import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell, TextLink } from "@/components/auth/auth-shell";
import { Field } from "@/components/auth/auth-ui";
import { requestPasswordReset } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Reset your password — TradeLikeNick",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      intro={
        <>
          We&apos;ll email you a link to choose a new one. Remembered it?{" "}
          <TextLink href="/signin">Sign in</TextLink>
        </>
      }
    >
      <div className="mt-8" />
      <AuthForm action={requestPasswordReset} submitLabel="Send reset link" pendingLabel="Sending…">
        <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      </AuthForm>
    </AuthShell>
  );
}
