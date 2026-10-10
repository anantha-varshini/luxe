import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = [
  "/profile",
  "/orders",
  "/checkout",
  "/admin",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    await jwtVerify(token, secret);

    return NextResponse.next();
  } catch {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};