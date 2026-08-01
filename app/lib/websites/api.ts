import type { PublicWebsiteSnapshot } from "./types";

const API_URL = process.env.ELEEVEON_API_URL?.replace(/\/$/, "");

export class WebsiteApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "WebsiteApiError";
  }
}

export async function getPublishedWebsite(slug: string): Promise<PublicWebsiteSnapshot | null> {
  if (!API_URL) {
    throw new WebsiteApiError("ELEEVEON_API_URL is not configured.");
  }

  const response = await fetch(`${API_URL}/public-websites/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    next: {
      revalidate: 60,
      tags: [`public-school-website:${slug}`],
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new WebsiteApiError(`The Eleeveon backend returned ${response.status}.`, response.status);
  }

  return (await response.json()) as PublicWebsiteSnapshot;
}
