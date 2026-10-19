import "server-only";
import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getUser } from "@/lib/supabase/server";

/**
 * Admins are the accounts listed in ADMIN_EMAILS (comma-separated). The
 * address must be confirmed, so nobody can sign up with an admin's email
 * and get in before verifying it.
 */
export function isAdmin(user: User | null | undefined): user is User {
  if (!user?.email || !user.email_confirmed_at) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(user.email.toLowerCase());
}

/**
 * For admin pages: the signed-in admin, a redirect to sign in, or a 404 for
 * members, so the panel doesn't advertise itself.
 */
export async function requireAdmin(next = "/admin"): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  if (!isAdmin(user)) notFound();
  return user;
}

/** For Server Actions and Route Handlers, which anyone can POST to: the admin, or null. */
export async function getAdmin(): Promise<User | null> {
  const user = await getUser();
  return isAdmin(user) ? user : null;
}
