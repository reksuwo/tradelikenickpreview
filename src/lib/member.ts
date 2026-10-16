import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getUser } from "@/lib/supabase/server";

/** What member pages and the account menu show about the signed-in user. */
export type Member = {
  fullName: string;
  firstName: string;
  email: string;
  /** Profile photo from Google/Apple sign-in, when there is one. */
  avatarUrl?: string;
  /** e.g. "October 2026" */
  joined: string;
};

export function toMember(user: User): Member {
  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";
  const fullName = String(meta.full_name || meta.name || email.split("@")[0] || "Member").trim();

  return {
    fullName,
    firstName: fullName.split(/\s+/)[0],
    email,
    avatarUrl: typeof meta.avatar_url === "string" ? meta.avatar_url : undefined,
    joined: new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  };
}

/**
 * The signed-in member, or a redirect to sign in. The proxy already turns
 * signed-out visitors away; this is the authoritative check.
 */
export async function requireMember(next: string): Promise<Member> {
  const user = await getUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return toMember(user);
}
