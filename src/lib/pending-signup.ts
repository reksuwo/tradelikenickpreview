import "server-only";
import { cookies } from "next/headers";
import { safeNext } from "@/lib/supabase/server";

/**
 * Remembers who is waiting on a confirmation email, so /check-email can show
 * the address and resend the link. Kept in an httpOnly cookie instead of the
 * URL so the email never lands in browser history or server logs.
 */
export const PENDING_COOKIE = "tln_pending_signup";

export type PendingSignup = { email: string; next: string };

export async function setPendingSignup(pending: PendingSignup) {
  (await cookies()).set(PENDING_COOKIE, JSON.stringify(pending), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function readPendingSignup(): Promise<PendingSignup | null> {
  const raw = (await cookies()).get(PENDING_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingSignup>;
    return typeof parsed.email === "string"
      ? { email: parsed.email, next: safeNext(parsed.next) }
      : null;
  } catch {
    return null;
  }
}
