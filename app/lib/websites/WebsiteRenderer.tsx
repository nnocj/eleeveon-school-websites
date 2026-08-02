"use client";

/**
 * app/lib/websites/WebsiteRenderer.tsx
 * --------------------------------------------------------------------------
 * Single public rendering entry point used by the website app and preview.
 */

import React from "react";

import type {
  WebsiteDataset,
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
  compact?: boolean;
  previewMode?: boolean;
  className?: string;
};

export default function WebsiteRenderer({
  dataset,
  settings,
  compact = false,
  previewMode = false,
  className,
}: WebsiteRendererProps) {
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
    >
      <WebsiteHeader
        dataset={dataset}
        settings={settings}
      />

      <WebsiteTemplateRouter
        dataset={dataset}
        settings={settings}
        compact={compact}
        previewMode={previewMode}
      />
    </div>
  );
}
