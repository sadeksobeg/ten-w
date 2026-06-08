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

  const orderRedirect = pathname.match(/^\/(ar|en|fr)\/order\/?$/);
  if (orderRedirect) {
    const url = request.nextUrl.clone();
    url.pathname = `/${orderRedirect[1]}/contact`;
    return NextResponse.redirect(url, 301);
  }

  const studioRedirect = pathname.match(/^\/(ar|en|fr)\/creators\/studio\/?$/);
  if (studioRedirect) {
    const url = request.nextUrl.clone();
    url.pathname = `/${studioRedirect[1]}/for-creators`;
    return NextResponse.redirect(url, 301);
  }

  const creatorsRedirect = pathname.match(/^\/(ar|en|fr)\/creators\/?$/);
  if (creatorsRedirect) {
    const url = request.nextUrl.clone();
    url.pathname = `/${creatorsRedirect[1]}/for-creators`;
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
