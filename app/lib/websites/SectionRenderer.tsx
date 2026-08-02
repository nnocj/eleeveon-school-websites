"use client";

/**
 * Backward-compatible single-section wrapper around the shared renderer.
 * New code should import WebsiteSectionRenderer from ./sections/WebsiteSectionRenderer.
 */
import React from "react";
import type {
  WebsiteDataset,
  WebsiteSectionKey,
  WebsiteTemplateSettings,
} from "./types";
import WebsiteSectionRenderer from "./sections/WebsiteSectionRenderer";

export type SectionRendererProps = {
  sectionKey: WebsiteSectionKey;
  dataset: WebsiteDataset;
  settings: WebsiteTemplateSettings;
  className?: string;
};

export default function SectionRenderer(props: SectionRendererProps) {
  return <WebsiteSectionRenderer {...props} />;
}

export { SectionRenderer };
