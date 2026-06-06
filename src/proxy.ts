import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionToken = 
    request.cookies.get("better-auth.session_token")?.value || 
    request.cookies.get("__secure-better-auth.session_token")?.value;

  const isConsolePath = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/competitors") ||
    request.nextUrl.pathname.startsWith("/insights") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/alerts") ||
    request.nextUrl.pathname.startsWith("/settings");

  if (isConsolePath && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    // Keep redirect callback url
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname === "/login" && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/competitors/:path*",
    "/insights/:path*",
    "/reports/:path*",
    "/alerts/:path*",
    "/settings/:path*",
    "/login",
  ],
};
