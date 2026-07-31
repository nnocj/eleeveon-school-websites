// middleware.ts

import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "eleeveon.com";

export function middleware(request: NextRequest) {
  const hostname = request.headers
    .get("host")
    ?.split(":")[0]
    .toLowerCase();

  if (!hostname) {
    return NextResponse.next();
  }

  // Allow the ordinary Vercel URL to work during development.
  if (hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // Do not rewrite the main platform domains.
  if (
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}` ||
    hostname === `schools.${ROOT_DOMAIN}`
  ) {
    return NextResponse.next();
  }

  const suffix = `.${ROOT_DOMAIN}`;

  if (!hostname.endsWith(suffix)) {
    return NextResponse.next();
  }

  const slug = hostname.slice(0, -suffix.length);

  if (!slug || slug.includes(".")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/sites/${encodeURIComponent(slug)}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};