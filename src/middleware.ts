import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { PUBLIC_ROUTES } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((path) => pathname.startsWith(path));

  // ✅ Allow public pages
  if (isPublicRoute) {
    if (token) {
      const user = await verifyJwt(token);
      if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // 🔐 Protected route
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const user = await verifyJwt(token);

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 🔁 Inject `x-user` header with user payload
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user", JSON.stringify(user));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/auth/login",
    "/auth/signup",
    "/auth/magic-link",
    "/api/auth/logout",
    "/api/account/:path*",
  ],
};
