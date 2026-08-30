import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect all /admin routes except auth routes (/admin/signin, /admin/signup)
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/signin") &&
    !pathname.startsWith("/admin/signup")
  ) {
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession || adminSession.value !== "true") {
      const signinUrl = new URL("/admin/signin", request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
