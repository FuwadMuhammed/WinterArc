import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: optimistic cookie check only. `requireAdmin()` in each admin
  // page/action is the real gate. Admin routes don't need a Supabase session.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLogin = pathname === "/admin/login";
    const authed = verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value) !== null;
    if (!authed && !isLogin) return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
    if (authed && isLogin) return NextResponse.redirect(new URL("/admin", request.nextUrl));
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
