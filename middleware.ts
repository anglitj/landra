import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/error"];

  // Special files that should be ignored
  const ignoredPaths = [
    "/favicon.ico",
    "/sw.js",
    "/workbox-",
    "/manifest.json",
    "/_next/",
    "/uploads/",
  ];

  // Check if current path should be ignored
  const isIgnoredPath = ignoredPaths.some((path) => pathname.startsWith(path));

  if (isIgnoredPath) {
    return NextResponse.next();
  }

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get session
  const session = request.cookies.get("session")?.value;
  const isAuthenticated = session ? await decrypt(session) : null;

  // If user is not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - workbox files
     * - manifest.json
     * - uploads (file uploads)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox|manifest.json|uploads).*)",
  ],
};
