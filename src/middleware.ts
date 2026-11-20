import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Prevents reverse proxies (e.g. aaPanel Nginx default proxy_cache) from caching
 * HTML or RSC navigation payloads across Docker rebuilds, which otherwise causes
 * mismatched webpack chunk hashes ("TypeError: e[o] is not a function").
 * Fingerprinted /_next/static/* and /fonts/* assets stay immutable via next.config.ts.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Keep immutable static assets, images, feeds, and APIs untouched
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/api/") ||
    /\.(?:svg|png|jpg|jpeg|webp|ico|woff2?|css|js|xml|txt|webmanifest)$/i.test(
      pathname
    )
  ) {
    return res;
  }

  res.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate"
  );
  res.headers.set("CDN-Cache-Control", "no-store");
  res.headers.set("Pragma", "no-cache");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|fonts|api|favicon\\.ico).*)"],
};
