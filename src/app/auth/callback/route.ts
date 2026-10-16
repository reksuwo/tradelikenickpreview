import { NextResponse, type NextRequest } from "next/server";
import { PENDING_COOKIE } from "@/lib/pending-signup";
import { createClient, safeNext } from "@/lib/supabase/server";

/**
 * Landing point after Google/Apple sign-in, email confirmation and password
 * reset links. Swaps the one-time code for a session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(new URL(next, origin));
      // Signed in now, so the "check your email" reminder is no longer needed.
      response.cookies.delete(PENDING_COOKIE);
      return response;
    }
  }

  return NextResponse.redirect(new URL("/signin?error=link", origin));
}
