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
      // Redirect non-admin users to their dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // If already authenticated and trying to access auth routes, redirect to appropriate dashboard
  if (isAuthRoute && token) {
    const userRole = token.role as string;
    if (adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all admin routes
    "/admin/:path*",
    // Match dashboard routes
    "/dashboard/:path*",
    // Match account routes
    "/account/:path*",
    // Match auth routes
    "/login",
    "/register",
  ],
};
