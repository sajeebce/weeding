import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/admin", "/dashboard", "/account"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"];

// Admin allowed roles
const adminRoles = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT", "CONTENT_MANAGER"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes - they handle their own auth and return JSON errors
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if the route requires protection
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the JWT token from the session cookie (edge-compatible)
  // NextAuth v5 uses "authjs.session-token" cookie name
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  // If trying to access protected route without authentication
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access admin routes, check for admin role
  if (pathname.startsWith("/admin") && token) {
    const userRole = token.role as string;
    if (!adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // If trying to access vendor portal, must be VENDOR role
  if (pathname.startsWith("/vendor") && !pathname.startsWith("/vendor/register") && token) {
    const userRole = token.role as string;
    if (userRole !== "VENDOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // /vendor/register requires login but not VENDOR role (they're registering)
  if (pathname.startsWith("/vendor") && !pathname.startsWith("/vendor/register") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and trying to access auth routes, redirect to appropriate dashboard
  if (isAuthRoute && token) {
    const userRole = token.role as string;
    if (adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (userRole === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/vendor/:path*",
    "/login",
    "/register",
  ],
};
