// proxy.ts

import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase() ||
  "eleeveon.com";

function cleanHostname(value: string) {
  return value
    .split(":")[0]
    .trim()
    .toLowerCase();
}

export function proxy(request: NextRequest) {
  const hostname = cleanHostname(
    request.headers.get("host") || "",
  );

  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/sites/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const rootHosts = new Set([
    ROOT_DOMAIN,
    `www.${ROOT_DOMAIN}`,
  ]);

  if (rootHosts.has(hostname)) {
    return NextResponse.next();
  }

  const domainSuffix = `.${ROOT_DOMAIN}`;

  if (hostname.endsWith(domainSuffix)) {
    const slug = hostname.slice(
      0,
      -domainSuffix.length,
    );

    if (slug && slug !== "www") {
      const destination = request.nextUrl.clone();

      destination.pathname =
        `/sites/${encodeURIComponent(slug)}` +
        (pathname === "/" ? "" : pathname);

      return NextResponse.rewrite(destination);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};