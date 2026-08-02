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

export function ModernAcademyTemplate({
  dataset,
  settings,
  previewMode = false,
}: WebsiteTemplateComponentProps) {
  return (
    <div
      className="website-template modern-academy"
      data-preview={previewMode || undefined}
      style={
        {
          "--website-primary":
            "#2563eb",
          "--website-radius":
            "18px",
          fontFamily:
            "Inter, system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <WebsiteSectionRenderer
        dataset={dataset}
        settings={settings}
      />
    </div>
  );
}

export const websiteTemplate: WebsiteTemplateDefinitionV2 = {
  key: "modern_academy",
  name: "Modern Academy",
  version: "2.0.0",
  category: "modern",
  tone: "Modern · spacious · premium",
  description:
    "A polished image-led school website with spacious sections and strong admissions presentation.",
  defaults: {
    contentWidth: "wide",
    density: "comfortable",
    sectionSpacing: "spacious",
    headerVariant: "standard",
    heroVariant: "split",
    statisticsVariant: "cards",
    teacherVariant: "cards",
    galleryVariant: "grid",
    footerVariant: "columns",
  },
  component:
    ModernAcademyTemplate,
};

export default websiteTemplate;
