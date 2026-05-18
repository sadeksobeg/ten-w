import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Required so `/` redirects to `/ar` (otherwise Next returns JSON 404 → Lighthouse fails)
    "/",
    "/(ar|en|fr)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
