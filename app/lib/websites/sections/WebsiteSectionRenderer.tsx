"use client";

/**
 * app/lib/websites/sections/WebsiteSectionRenderer.tsx
 * --------------------------------------------------------------------------
 * Shared page-aware section renderer.
 *
 * Rendering priority:
 * 1. Render the resolved page's saved sections in their saved order.
 * 2. Fall back to the global template-independent section registry only when
 *    no saved sections exist for the page.
 *
 * This file never queries Dexie or the backend.
 */

import React from "react";

import type {
  WebsiteDataset,
  WebsiteItem,
  WebsiteMedia,
  WebsitePage,
  WebsiteSection,
  WebsiteSectionKey,
  WebsiteTemplateSettings,
} from "../types";

import {
  getWebsiteSectionLabel,
  isWebsiteSectionVisible,
  resolveWebsiteSectionOrder,
} from "./sectionRegistry";

import {
  ContactSection,
  ContentSection,
  FooterSection,
  GallerySection,
  HeroSection,
  ItemGridSection,
  PeopleSection,
  PrincipalSection,
  StatisticsSection,
} from "../components";

export type WebsiteSectionRendererProps = {
  dataset: WebsiteDataset;
  settings: WebsiteTemplateSettings;
  page?: WebsitePage;
  sectionKey?: WebsiteSectionKey;
  className?: string;
};

function normalizeSectionType(
  value: string | undefined,
): WebsiteSectionKey | "content" {
  const type = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  switch (type) {
    case "program":
    case "programme":
    case "programmes":
      return "programs";

    case "academic_structure":
    case "academic_structures":
    case "academic_levels":
      return "academic_structures";

    case "organisation":
    case "organisations":
      return "organizations";

    case "portal_highlights":
    case "school_highlights":
      return "highlights";

    case "calendar_event":
    case "calendar_events":
      return "events";

    case "leadership":
    case "headteacher":
    case "head_teacher":
      return "principal";

    case "staff":
    case "team":
      return "teachers";

    case "news":
      return "announcements";

    case "hero":
    case "statistics":
    case "about":
    case "principal":
    case "programs":
    case "subjects":
    case "organizations":
    case "teachers":
    case "highlights":
    case "announcements":
    case "events":
    case "gallery":
    case "contact":
    case "footer":
      return type;

    default:
      return "content";
  }
}

function itemsForSection(
  key: WebsiteSectionKey,
  dataset: WebsiteDataset,
): WebsiteItem[] {
  switch (key) {
    case "academic_structures":
      return dataset.academicStructures;
    case "programs":
    case "programmes":
      return dataset.programs;
    case "subjects":
      return dataset.subjects;
    case "organizations":
      return dataset.organizations;
    case "highlights":
      return dataset.highlights;
    case "announcements":
      return dataset.announcements;
    case "events":
      return dataset.events;
    default:
      return [];
  }
}

function savedSectionVisible(
  section: WebsiteSection,
): boolean {
  const sectionSettings =
    section.settings &&
    typeof section.settings === "object"
      ? section.settings
      : {};

  return (
    sectionSettings.active !== false &&
    sectionSettings.visible !== false &&
    sectionSettings.hidden !== true
  );
}

function savedSectionId(
  section: WebsiteSection,
  type: string,
): string {
  return (
    String(section.sectionKey || "").trim() ||
    String(section.id || "").trim() ||
    type
  );
}

function savedSectionTitle(
  section: WebsiteSection,
  key: WebsiteSectionKey | "content",
  settings: WebsiteTemplateSettings,
): string {
  if (section.heading?.trim()) {
    return section.heading.trim();
  }

  if (key === "content") {
    return section.subheading?.trim() || "";
  }

  return getWebsiteSectionLabel(key, settings);
}

function sectionMedia(
  section: WebsiteSection,
  fallback?: WebsiteMedia,
): WebsiteMedia | undefined {
  return (
    section.primaryMedia ||
    section.backgroundMedia ||
    section.media?.find((item) => item?.url) ||
    fallback
  );
}

function customItems(
  section: WebsiteSection,
  fallback: WebsiteItem[],
): WebsiteItem[] {
  return section.items?.length
    ? section.items
    : fallback;
}

function renderRegistrySection(
  key: WebsiteSectionKey,
  dataset: WebsiteDataset,
  settings: WebsiteTemplateSettings,
): React.ReactNode {
  const label = getWebsiteSectionLabel(
    key,
    settings,
  );

  switch (key) {
    case "hero":
      return (
        <HeroSection
          dataset={dataset}
          settings={settings}
        />
      );

    case "statistics":
      return (
        <StatisticsSection
          title={label}
          statistics={dataset.statistics}
          settings={settings}
        />
      );

    case "about":
      return (
        <ContentSection
          id="about"
          title={label}
          body={
            settings.aboutText ||
            dataset.website.description ||
            dataset.school.description ||
            dataset.school.motto ||
            ""
          }
          media={
            dataset.school.banner ||
            dataset.branch?.banner
          }
        />
      );

    case "principal":
      return (
        <PrincipalSection
          title={label}
          principal={dataset.principal}
          message={settings.principalMessage}
          showPhoto={settings.showPrincipalPhoto}
        />
      );

    case "teachers":
      return (
        <PeopleSection
          id="teachers"
          title={label}
          people={dataset.teachers}
          showPhotos={settings.showTeacherPhotos}
          variant={settings.teacherVariant}
        />
      );

    case "gallery":
      return (
        <GallerySection
          title={label}
          media={dataset.gallery}
          variant={settings.galleryVariant}
        />
      );

    case "contact":
      return (
        <ContactSection
          title={label}
          dataset={dataset}
          settings={settings}
        />
      );

    case "footer":
      return (
        <FooterSection
          dataset={dataset}
          settings={settings}
        />
      );

    default:
      return (
        <ItemGridSection
          id={key}
          title={label}
          items={itemsForSection(key, dataset)}
          showCodes={
            key === "subjects"
              ? settings.showSubjectCodes
              : true
          }
          showDescriptions={
            key === "programs" ||
            key === "programmes"
              ? settings.showProgramDescriptions
              : true
          }
        />
      );
  }
}

function renderSavedSection(
  section: WebsiteSection,
  dataset: WebsiteDataset,
  settings: WebsiteTemplateSettings,
): React.ReactNode {
  const key = normalizeSectionType(
    section.sectionType ||
    section.sectionKey,
  );

  const id = savedSectionId(
    section,
    key,
  );

  const title = savedSectionTitle(
    section,
    key,
    settings,
  );

  const body =
    section.body ||
    (typeof section.content?.body === "string"
      ? section.content.body
      : undefined) ||
    (typeof section.content?.text === "string"
      ? section.content.text
      : undefined);

  switch (key) {
    case "hero": {
      const heroMedia = sectionMedia(
        section,
        dataset.branch?.banner ||
          dataset.school.banner ||
          dataset.gallery[0],
      );

      const heroDataset: WebsiteDataset = {
        ...dataset,
        school: {
          ...dataset.school,
          banner:
            heroMedia ||
            dataset.school.banner,
        },
        branch: dataset.branch
          ? {
              ...dataset.branch,
              banner:
                heroMedia ||
                dataset.branch.banner,
            }
          : dataset.branch,
      };

      const heroSettings: WebsiteTemplateSettings = {
        ...settings,
        heroEyebrow:
          section.subheading ||
          settings.heroEyebrow,
        heroHeading:
          section.heading ||
          settings.heroHeading,
        heroBody:
          body ||
          settings.heroBody,
      };

      return (
        <HeroSection
          dataset={heroDataset}
          settings={heroSettings}
        />
      );
    }

    case "statistics":
      return (
        <StatisticsSection
          title={title}
          statistics={dataset.statistics}
          settings={settings}
        />
      );

    case "about":
      return (
        <ContentSection
          id={id}
          title={title}
          body={
            body ||
            settings.aboutText ||
            dataset.website.description ||
            dataset.school.description ||
            dataset.school.motto
          }
          media={sectionMedia(
            section,
            dataset.school.banner ||
              dataset.branch?.banner,
          )}
        />
      );

    case "principal":
      return (
        <PrincipalSection
          title={title}
          principal={dataset.principal}
          message={
            body ||
            settings.principalMessage
          }
          showPhoto={
            settings.showPrincipalPhoto
          }
        />
      );

    case "teachers":
      return (
        <PeopleSection
          id={id}
          title={title}
          people={dataset.teachers}
          showPhotos={
            settings.showTeacherPhotos
          }
          variant={
            (section.variant as WebsiteTemplateSettings["teacherVariant"]) ||
            settings.teacherVariant
          }
        />
      );

    case "gallery": {
      const media = section.media?.length
        ? section.media
        : [
            section.primaryMedia,
            section.backgroundMedia,
          ].filter(
            (
              item,
            ): item is WebsiteMedia =>
              Boolean(item?.url),
          ).length
          ? [
              section.primaryMedia,
              section.backgroundMedia,
            ].filter(
              (
                item,
              ): item is WebsiteMedia =>
                Boolean(item?.url),
            )
          : dataset.gallery;

      return (
        <GallerySection
          title={title}
          media={media}
          variant={
            (section.variant as WebsiteTemplateSettings["galleryVariant"]) ||
            settings.galleryVariant
          }
        />
      );
    }

    case "contact":
      return (
        <ContactSection
          title={title}
          dataset={dataset}
          settings={settings}
        />
      );

    case "footer":
      return (
        <FooterSection
          dataset={dataset}
          settings={{
            ...settings,
            footerText:
              body ||
              settings.footerText,
          }}
        />
      );

    case "content":
      return (
        <ContentSection
          id={id}
          title={title}
          body={body}
          media={sectionMedia(section)}
        />
      );

    default: {
      const items = customItems(
        section,
        itemsForSection(key, dataset),
      );

      return (
        <ItemGridSection
          id={id}
          title={title}
          items={items}
          showCodes={
            key === "subjects"
              ? settings.showSubjectCodes
              : true
          }
          showDescriptions={
            key === "programs" ||
            key === "programmes"
              ? settings.showProgramDescriptions
              : true
          }
        />
      );
    }
  }
}

export default function WebsiteSectionRenderer({
  dataset,
  settings,
  page,
  sectionKey,
  className,
}: WebsiteSectionRendererProps) {
  const savedSections = (page?.sections || [])
    .filter(savedSectionVisible);

  const useSavedSections =
    !sectionKey &&
    savedSections.length > 0;

  const fallbackKeys = sectionKey
    ? [sectionKey]
    : resolveWebsiteSectionOrder(settings);

  return (
    <div
      className={[
        "website-section-renderer",
        useSavedSections
          ? "has-saved-sections"
          : "uses-default-sections",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-page={page?.slug || "home"}
    >
      {useSavedSections
        ? savedSections.map(
            (section, index) => (
              <React.Fragment
                key={
                  section.id ||
                  `${section.sectionKey}-${index}`
                }
              >
                {renderSavedSection(
                  section,
                  dataset,
                  settings,
                )}
              </React.Fragment>
            ),
          )
        : fallbackKeys
            .filter((key) =>
              isWebsiteSectionVisible(
                key,
                settings,
              ),
            )
            .map((key) => (
              <React.Fragment key={key}>
                {renderRegistrySection(
                  key,
                  dataset,
                  settings,
                )}
              </React.Fragment>
            ))}
    </div>
  );
}