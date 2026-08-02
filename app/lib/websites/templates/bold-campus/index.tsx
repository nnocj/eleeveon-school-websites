"use client";

import React from "react";

import type {
  WebsiteTemplateComponentProps,
  WebsiteTemplateDefinition,
} from "../../types";

import WebsiteSectionRenderer from "../../sections/WebsiteSectionRenderer";

type WebsiteTemplateDefinitionV2 = Omit<
  WebsiteTemplateDefinition,
  "component" | "defaultSections"
> & {
  component: React.ComponentType<WebsiteTemplateComponentProps>;
};

export function BoldCampusTemplate({
  dataset,
  settings,
  page,
  compact = false,
  previewMode = false,
}: WebsiteTemplateComponentProps) {
  return (
    <div
      className={[
        "website-template",
        "bold-campus",
        compact ? "is-compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-preview={previewMode || undefined}
      data-page={page?.slug || "home"}
      style={
        {
          "--website-primary": "#7c3aed",
          "--website-radius": "22px",
        } as React.CSSProperties
      }
    >
      <WebsiteSectionRenderer
        dataset={dataset}
        settings={settings}
        page={page}
      />
    </div>
  );
}

export const websiteTemplate: WebsiteTemplateDefinitionV2 = {
  key: "bold_campus",
  name: "Bold Campus",
  version: "2.0.0",
  category: "energetic",
  tone: "Bright · bold · active",
  description:
    "A lively, high-energy school website with bold typography, strong colour and immersive media.",
  defaults: {
    contentWidth: "wide",
    density: "compact",
    sectionSpacing: "standard",
    headerVariant: "bold",
    heroVariant: "full_bleed",
    statisticsVariant: "large_numbers",
    teacherVariant: "portrait_cards",
    galleryVariant: "masonry",
    footerVariant: "dark",
  },
  component: BoldCampusTemplate,
};

export default websiteTemplate;