"use client";

/**
 * app/lib/websites/WebsiteTemplateRouter.tsx
 * --------------------------------------------------------------------------
 * Resolves the selected template and applies its visual defaults without
 * replacing school-controlled labels, visibility, content or section order.
 */

import React from "react";

import type {
  WebsiteDataset,
  WebsiteTemplateComponentProps,
  WebsiteTemplateSettings,
} from "./types";

import { createWebsiteTemplateSettings } from "./shared/websiteTemplateSettings";
import {
  getDefaultWebsiteTemplate,
  getWebsiteTemplate,
} from "./templates/registry";
import { WebsiteUnavailable } from "./components";

export type WebsiteTemplateRouterProps = {
  dataset: WebsiteDataset;
  settings: WebsiteTemplateSettings;
  compact?: boolean;
  previewMode?: boolean;
};

export default function WebsiteTemplateRouter({
  dataset,
  settings,
  compact = false,
  previewMode = false,
}: WebsiteTemplateRouterProps) {
  const template =
    getWebsiteTemplate(settings.templateKey) ||
    getDefaultWebsiteTemplate();

  if (!template?.component) {
    return (
      <WebsiteUnavailable message="The selected website template is unavailable." />
    );
  }

  const effectiveSettings = createWebsiteTemplateSettings(
    settings,
    template,
  );

  const TemplateComponent =
    template.component as React.ComponentType<WebsiteTemplateComponentProps>;

  return (
    <TemplateComponent
      dataset={dataset}
      settings={effectiveSettings}
      compact={compact}
      previewMode={previewMode}
    />
  );
}
