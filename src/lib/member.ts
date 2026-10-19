import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { getUser } from "@/lib/supabase/server";

/** What member pages and the account menu show about the signed-in user. */
export type Member = {
  fullName: string;
  firstName: string;
  email: string;
  /** Uploaded profile photo, else the one from Google/Apple sign-in, when there is one. */
  avatarUrl?: string;
  /** True when avatarUrl is a photo the member uploaded (so it can be removed). */
  hasUploadedPhoto: boolean;
  /** e.g. "October 2026" */
  joined: string;
  /** Can open the admin panel. */
  isAdmin: boolean;
};

/** Where the browser loads an uploaded profile photo (Avatars/<file> in R2) from. */
export function avatarPath(file: string) {
  return `/api/avatars/${encodeURIComponent(file)}`;
}

export function toMember(user: User): Member {
  const meta = user.user_metadata ?? {};
  const email = user.email ?? "";
  const fullName = String(meta.full_name || meta.name || email.split("@")[0] || "Member").trim();
  // Uploads live under `photo`, not `avatar_url`, because Google/Apple sign-in rewrites avatar_url.
  const photo = typeof meta.photo === "string" && meta.photo ? avatarPath(meta.photo) : undefined;

  return {
    fullName,
    firstName: fullName.split(/\s+/)[0],
    email,
    avatarUrl: photo ?? (typeof meta.avatar_url === "string" ? meta.avatar_url : undefined),
    hasUploadedPhoto: Boolean(photo),
    joined: new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    isAdmin: isAdmin(user),
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
