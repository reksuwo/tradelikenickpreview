import { redirect } from "next/navigation";
import { getUser, safeNext } from "@/lib/supabase/server";
import { AuthPanel, type AuthMode } from "./auth-panel";
import { AuthShell } from "./auth-shell";
import { SocialButtons } from "./social-buttons";

const ERRORS: Record<string, string> = {
  link: "That link couldn't sign you in here. If you just confirmed your email, sign in below. Otherwise the link has expired, so request a new one.",
  oauth: "We couldn't start that sign-in. Try again, or use your email and password.",
};

/** Shared by /signin and /signup: one page, two tabs. */
export async function AuthPage({
  mode,
  searchParams,
}: {
  mode: AuthMode;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getUser()) redirect(next);

  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <AuthShell>
      <AuthPanel initialMode={mode} next={next} error={error} social={<SocialButtons next={next} />} />
    </AuthShell>
  );
}
