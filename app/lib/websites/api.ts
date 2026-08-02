/**
 * app/lib/websites/api.ts
 * --------------------------------------------------------------------------
 * Server-safe public website API client.
 *
 * Supports:
 * - { dataset, templateSettings };
 * - a direct WebsiteDataset response;
 * - new pages[].sections responses;
 * - older flat sections responses normalized into a compatibility home page.
 */

import type {
  PublicWebsiteApiResponse,
  PublicWebsitePayload,
  WebsiteDataset,
  WebsitePage,
  WebsiteResolvedPage,
} from "./types";

import { normalizeWebsiteDataset } from "./data/normalizeWebsiteDataset";
import { createWebsiteTemplateSettings } from "./shared/websiteTemplateSettings";
import { getWebsiteTemplate } from "./templates/registry";

const API_URL = (
  process.env.PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

function isPayload(
  value: PublicWebsiteApiResponse,
): value is PublicWebsitePayload {
  return Boolean(
    value &&
      typeof value === "object" &&
      "dataset" in value &&
      value.dataset,
  );
}

function normalizePayload(
  raw: PublicWebsiteApiResponse,
): PublicWebsitePayload {
  const rawDataset = isPayload(raw)
    ? raw.dataset
    : (raw as WebsiteDataset);

  const dataset = normalizeWebsiteDataset(
    rawDataset as WebsiteDataset &
      Record<string, unknown>,
  );

  const suppliedSettings = isPayload(raw)
    ? raw.templateSettings
    : raw.templateSettings || raw.settings;

  const template = getWebsiteTemplate(
    suppliedSettings?.templateKey ||
      dataset.website.templateKey,
  );

  return {
    dataset,
    templateSettings:
      createWebsiteTemplateSettings(
        suppliedSettings,
        template,
      ),
  };
}

export async function getPublishedWebsite(
  slug: string,
): Promise<PublicWebsitePayload | null> {
  const normalizedSlug = String(slug || "")
    .trim()
    .toLowerCase();

  if (!normalizedSlug) return null;

  const response = await fetch(
    `${API_URL}/public-websites/${encodeURIComponent(
      normalizedSlug,
    )}`,
    {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
        tags: [
          `public-website:${normalizedSlug}`,
        ],
      },
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      `Unable to load published website (${response.status}).`,
    );
  }

  const raw =
    (await response.json()) as PublicWebsiteApiResponse;

  return normalizePayload(raw);
}

function publishedPage(
  page: WebsitePage,
): boolean {
  return (
    page.status === "published" &&
    Boolean(page.slug)
  );
}

function normalizePath(
  path?: string[],
): string {
  return (path || [])
    .map((value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/^\/+|\/+$/g, ""),
    )
    .filter(Boolean)
    .join("/");
}

function fallbackHomePage(
  dataset: WebsiteDataset,
): WebsiteResolvedPage {
  return {
    id: "automatic-home",
    websiteSettingId:
      dataset.websiteSettingId ||
      dataset.website.id ||
      "",
    slug: "home",
    title:
      dataset.website.siteName ||
      dataset.school.name,
    description:
      dataset.website.description ||
      dataset.school.description ||
      dataset.school.motto,
    pageType: "home",
    status: "published",
    isHomePage: true,
    displayOrder: 0,
    sections: dataset.sections || [],
  };
}

export function resolveWebsitePage(
  payload: PublicWebsitePayload,
  path?: string[],
): WebsiteResolvedPage | null {
  const requestedPath = normalizePath(path);
  const pages = (payload.dataset.pages || [])
    .filter(publishedPage)
    .sort(
      (a, b) =>
        a.displayOrder - b.displayOrder,
    );

  const wantsHome =
    !requestedPath ||
    requestedPath === "home" ||
    requestedPath === "index";

  if (wantsHome) {
    const savedHome =
      pages.find((page) => page.isHomePage) ||
      pages.find((page) =>
        ["home", "index"].includes(
          page.slug.toLowerCase(),
        ),
      );

    if (savedHome) return savedHome;

    // Emergency fallback only. This remains useful for published websites that
    // predate page records or while a deployment is migrating.
    return fallbackHomePage(payload.dataset);
  }

  return (
    pages.find(
      (page) =>
        page.slug
          .toLowerCase()
          .replace(/^\/+|\/+$/g, "") ===
        requestedPath,
    ) || null
  );
}