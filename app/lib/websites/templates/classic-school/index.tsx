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

export function ClassicSchoolTemplate({
  dataset,
  settings,
  previewMode = false,
}: WebsiteTemplateComponentProps) {
  return (
    <div
      className="website-template classic-school"
      data-preview={previewMode || undefined}
      style={
        {
          "--website-primary":
            "#1e3a5f",
          "--website-radius": "8px",
          fontFamily:
            "Georgia, 'Times New Roman', serif",
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
  key: "classic_school",
  name: "Classic School",
  version: "2.0.0",
  category: "institutional",
  tone: "Formal · trusted · structured",
  description:
    "A formal institutional website for established schools, academies and mission schools.",
  defaults: {
    contentWidth: "standard",
    density: "comfortable",
    sectionSpacing: "standard",
    headerVariant:
      "institutional",
    heroVariant: "banner",
    statisticsVariant: "inline",
    teacherVariant:
      "compact_list",
    galleryVariant: "grid",
    footerVariant:
      "institutional",
  },
  component: ClassicSchoolTemplate,
};

export default websiteTemplate;
