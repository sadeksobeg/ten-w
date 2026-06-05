import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const INVITE_SYSTEM_PREFIXES = ["/admin", "/invite"];

function isInviteSystemPath(pathname: string): boolean {
  return INVITE_SYSTEM_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}`;
    return NextResponse.redirect(url, 301);
  }

  if (isInviteSystemPath(pathname)) {
    const res = NextResponse.next();
    if (pathname.startsWith("/admin")) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return res;
  }

  const res = intlMiddleware(request);
  if (/\/growth(\/|$)/.test(pathname)) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  matcher: [
    "/",
    "/(ar|en|fr)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
