import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

/**
 * Refreshes the Supabase session cookie and enforces auth:
 * - signed-out users are sent to /login for every page except /login
 * - signed-in users visiting /login are sent to /dashboard
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // getClaims() verifies the JWT, unlike getSession(). Don't run code between
  // createServerClient and this call, or sessions may randomly log out.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.includes(path);

  if (!isLoggedIn && !isPublic) {
    return redirectWithCookies(request, response, "/login");
  }
  if (isLoggedIn && (isPublic || path === "/")) {
    return redirectWithCookies(request, response, "/dashboard");
  }

  return response;
}

// Keep any refreshed session cookies when redirecting.
function redirectWithCookies(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
