/**
 * app/lib/websites/api.ts
 * --------------------------------------------------------------------------
 * Server-safe public website API client.
 *
 * Supports both:
 * - the Phase 10 response: { dataset, templateSettings };
 * - the current legacy backend response: WebsiteDataset.
 */

import type {
  PublicWebsiteApiResponse,
  PublicWebsitePayload,
  WebsiteDataset,
  WebsiteResolvedPage,
  WebsiteTemplateSettings,
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
    rawDataset as WebsiteDataset & Record<string, unknown>,
  );

  const suppliedSettings = isPayload(raw)
    ? raw.templateSettings
    : raw.templateSettings || raw.settings;

  const template = getWebsiteTemplate(
    suppliedSettings?.templateKey ||
      dataset.website.templateKey,
  );

  const templateSettings = createWebsiteTemplateSettings(
    suppliedSettings,
    template,
  );

  return {
    dataset,
    templateSettings,
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
    `${API_URL}/public-websites/${encodeURIComponent(normalizedSlug)}`,
    {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
        tags: [`public-website:${normalizedSlug}`],
      },
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      `Unable to load published website (${response.status}).`,
    );
  }

  const raw = (await response.json()) as PublicWebsiteApiResponse;
  return normalizePayload(raw);
}

export function resolveWebsitePage(
  payload: PublicWebsitePayload,
  path?: string[],
): WebsiteResolvedPage | null {
  const segments = (path || [])
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  if (!segments.length || segments[0] === "home" || segments[0] === "index") {
    return {
      slug: "home",
      title:
        payload.dataset.website.siteName ||
        payload.dataset.school.name,
      description:
        payload.dataset.website.description ||
        payload.dataset.school.description ||
        payload.dataset.school.motto,
    };
  }

  // The report-style website system currently publishes one shared single page.
  // Saved multi-page content can be introduced later without changing this API.
  return null;
}
