"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TERMS_VERSION } from "@/lib/legal";
import { passwordError } from "@/lib/password-rules";
import { readPendingSignup, setPendingSignup } from "@/lib/pending-signup";
import { createClient, safeNext } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Turns a Supabase auth error into a sentence a visitor can act on. */
function friendly(error: { code?: string; status?: number; name?: string; message: string }) {
  if (error.name === "AuthRetryableFetchError" || error.status === 0 || /fetch failed/i.test(error.message)) {
    return "We can't reach the account service right now. Try again in a moment.";
  }
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match an account.";
    case "email_not_confirmed":
      return "Confirm your email first. Check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Sign in instead.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    case "same_password":
      return "Choose a password you haven't used before.";
    default:
      return error.message;
  }
}

function callbackUrl(next: string) {
  return `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, "email");
  const password = formData.get("password");
  if (!email || typeof password !== "string" || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error) };

  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const password = formData.get("password");

  if (name.length < 2) return { error: "Enter your name." };
  if (!email.includes("@")) return { error: "Enter a valid email." };
  if (typeof password !== "string") return { error: "Choose a password." };
  const weak = passwordError(password);
  if (weak) return { error: weak };
  if (formData.get("terms") !== "accepted") {
    return { error: "Tick the box to agree to the Terms of Service and Privacy Policy." };
  }

  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Record which version of the terms this person agreed to, and when.
      data: { full_name: name, terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString() },
      emailRedirectTo: callbackUrl(next),
    },
  });
  if (error) return { error: friendly(error) };

  // With "Confirm email" on (Supabase's default) there is no session until the link is clicked.
  if (!data.session) {
    await setPendingSignup({ email, next });
    redirect("/check-email");
  }
  redirect(next);
}

export async function resendConfirmation(): Promise<AuthState> {
  const pending = await readPendingSignup();
  if (!pending) return { error: "We couldn't tell which email to resend to. Sign up again." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: pending.email,
    options: { emailRedirectTo: callbackUrl(pending.next) },
  });
  if (error) return { error: friendly(error) };

  return { message: `Sent again. Check ${pending.email} in a minute or two.` };
}

export async function signInWithProvider(formData: FormData) {
  const provider = formData.get("provider");
  if (provider !== "google" && provider !== "apple") return;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl(safeNext(formData.get("next"))) },
  });
  if (error || !data.url) redirect("/signin?error=oauth");
  redirect(data.url);
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = field(formData, "email");
  if (!email.includes("@")) return { error: "Enter a valid email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl("/reset-password"),
  });
  if (error) return { error: friendly(error) };

  // Same reply whether or not the account exists, so emails can't be probed.
  return { message: `If ${email} has an account, a reset link is on its way.` };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get("password");
  if (typeof password !== "string") return { error: "Choose a password." };
  const weak = passwordError(password);
  if (weak) return { error: weak };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendly(error) };

  redirect("/browse");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = field(formData, "name");
  if (name.length < 2) return { error: "Enter your name." };
  if (name.length > 80) return { error: "Keep your name under 80 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
  if (error) return { error: friendly(error) };

  // The name shows in the header on every member page.
  revalidatePath("/", "layout");
  return { message: "Profile saved." };
}

/** Like updatePassword, but stays on the settings page. */
export async function changePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get("password");
  if (typeof password !== "string") return { error: "Choose a password." };
  const weak = passwordError(password);
  if (weak) return { error: weak };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendly(error) };

  return { message: "Password updated." };
}

/** Ends every session for this account, on all devices. */
export async function signOutEverywhere() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/signin");
}
