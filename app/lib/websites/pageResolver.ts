import type { PublicWebsiteSnapshot, WebsitePage } from "./types";

function normalizeSegment(value: string) {
  return decodeURIComponent(value).trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}

export function requestedPageSlug(path?: string[]) {
  if (!path?.length) return "home";
  return path.map(normalizeSegment).filter(Boolean).join("/") || "home";
}

export function resolveWebsitePage(snapshot: PublicWebsiteSnapshot, path?: string[]): WebsitePage | null {
  const requested = requestedPageSlug(path);
  const pages = snapshot.pages ?? [];

  return (
    pages.find((page) => normalizeSegment(page.slug || "home") === requested) ??
    (requested === "home"
      ? pages.find((page) => ["", "home", "index"].includes(normalizeSegment(page.slug || "home")))
      : null) ??
    null
  );
}
