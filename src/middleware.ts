import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "fleet_session_token";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "fleet-calendar-default-secret-key-change-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let session: { userId: number; username: string; role: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload as unknown as { userId: number; username: string; role: string };
    } catch {
      session = null;
    }
  }

  // 若已登入且造訪登入頁，直接導向行事曆
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
    return NextResponse.next();
  }

  // 受保護路由檢查
  const isProtected =
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/mileage") ||
    pathname.startsWith("/admin") ||
    pathname === "/";

  if (isProtected) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 若存取後台但非管理員角色，導回行事曆
    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/calendar", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路徑，排除靜態資源及內部路徑
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
