"use client";

/**
 * app/lib/websites/WebsiteRenderer.tsx
 * --------------------------------------------------------------------------
 * Single public rendering entry point used by:
 * - the public website route;
 * - Branch Settings live preview;
 * - future exported previews.
 *
 * The renderer accepts the already resolved page. When no page is supplied,
 * it safely resolves the saved home page before falling back to the flat
 * compatibility sections.
 */

import React, { useMemo } from "react";

import type {
  WebsiteDataset,
  WebsitePage,
  WebsiteTemplateSettings,
} from "./types";

import {
  WebsiteHeader,
  WebsiteUnavailable,
} from "./components";

import WebsiteTemplateRouter from "./WebsiteTemplateRouter";

export type WebsiteRendererProps = {
  dataset: WebsiteDataset;
  settings: WebsiteTemplateSettings;
  page?: WebsitePage | null;
  compact?: boolean;
  previewMode?: boolean;
  className?: string;
};

function resolveHomePage(
  dataset: WebsiteDataset,
): WebsitePage | undefined {
  const publishedPages = (dataset.pages || [])
    .filter(
      (candidate) =>
        candidate.status === "published",
    )
    .sort(
      (a, b) =>
        a.displayOrder - b.displayOrder,
    );

  const savedHome =
    publishedPages.find(
      (candidate) => candidate.isHomePage,
    ) ||
    publishedPages.find((candidate) =>
      ["home", "index"].includes(
        candidate.slug.toLowerCase(),
      ),
    );

  if (savedHome) return savedHome;

  if (dataset.sections?.length) {
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
      sections: dataset.sections,
    };
  }

  return undefined;
}

export default function WebsiteRenderer({
  dataset,
  settings,
  page,
  compact = false,
  previewMode = false,
  className,
}: WebsiteRendererProps) {
  const resolvedPage = useMemo(
    () => page || resolveHomePage(dataset),
    [dataset, page],
  );

  if (!dataset?.school?.name) {
    return <WebsiteUnavailable />;
  }

  return (
    <div
      className={[
        "eleeveon-public-website",
        `website-density-${settings.density}`,
        `website-width-${settings.contentWidth}`,
        compact ? "is-compact" : "",
        previewMode ? "is-preview" : "",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-template={settings.templateKey}
      data-page={resolvedPage?.slug || "home"}
    >
      <WebsiteHeader
        dataset={dataset}
        settings={settings}
      />

      <WebsiteTemplateRouter
        dataset={dataset}
        settings={settings}
        page={resolvedPage}
        compact={compact}
        previewMode={previewMode}
      />
    </div>
  );
}