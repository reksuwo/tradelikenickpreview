import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Paths that need a signed-in member. */
const PROTECTED = ["/browse", "/account"];

/** Marketing and sign-in pages, and where a signed-in member goes instead. */
const MEMBER_REDIRECTS: Record<string, string> = {
  "/": "/browse",
  "/signin": "/browse",
  "/signup": "/browse",
  "/courses": "/browse/courses",
  "/books": "/browse/books",
  "/testimonials": "/browse",
};

/**
 * Refreshes the Supabase session cookie on each request and sends signed-out
 * visitors away from member pages. Pages still check the user themselves.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims: it refreshes the session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const { pathname, search } = request.nextUrl;

  // Members live in /browse: send them past the marketing and sign-in pages.
  const memberHome = MEMBER_REDIRECTS[pathname];
  if (signedIn && memberHome) {
    const url = request.nextUrl.clone();
    url.pathname = memberHome;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  if (!signedIn && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}
