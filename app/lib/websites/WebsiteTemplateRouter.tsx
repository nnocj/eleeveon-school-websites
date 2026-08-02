"use client";

/**
 * app/lib/websites/WebsiteTemplateRouter.tsx
 * --------------------------------------------------------------------------
 * Resolves the selected template and applies its visual defaults without
 * replacing school-controlled labels, visibility, content, page sections or
 * section order.
 *
 * Preview and public rendering both pass through this exact router.
 */

import React from "react";

import type {
  WebsiteDataset,
  WebsitePage,
  WebsiteTemplateComponentProps,
  WebsiteTemplateSettings,
} from "./types";

import {
  createWebsiteTemplateSettings,
} from "./shared/websiteTemplateSettings";

import {
  getDefaultWebsiteTemplate,
  getWebsiteTemplate,
} from "./templates/registry";

import {
  WebsiteUnavailable,
} from "./components";

export type WebsiteTemplateRouterProps = {
  dataset: WebsiteDataset;
  settings: WebsiteTemplateSettings;
  page?: WebsitePage | null;
  compact?: boolean;
  previewMode?: boolean;
};

export default function WebsiteTemplateRouter({
  dataset,
  settings,
  page,
  compact = false,
  previewMode = false,
}: WebsiteTemplateRouterProps) {
  const template =
    getWebsiteTemplate(
      settings.templateKey ||
        dataset.website.templateKey,
    ) ||
    getDefaultWebsiteTemplate();

  if (!template?.component) {
    return (
      <WebsiteUnavailable message="The selected website template is unavailable." />
    );
  }

  const effectiveSettings =
    createWebsiteTemplateSettings(
      {
        ...settings,
        templateKey:
          template.key,
        templateVersion:
          settings.templateVersion ||
          template.version,
      },
      template,
    );

  const TemplateComponent =
    template.component as React.ComponentType<WebsiteTemplateComponentProps>;

  return (
    <TemplateComponent
      dataset={dataset}
      settings={effectiveSettings}
      page={page || undefined}
      compact={compact}
      previewMode={previewMode}
    />
  );
}