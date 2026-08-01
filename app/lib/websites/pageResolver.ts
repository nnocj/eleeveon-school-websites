import type {
  PublicWebsiteSnapshot,
  WebsitePage,
  WebsiteSection,
} from "./types";

function normalizeSegment(value: string) {
  return decodeURIComponent(value)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

export function requestedPageSlug(path?: string[]) {
  if (!path?.length) return "home";
  return path.map(normalizeSegment).filter(Boolean).join("/") || "home";
}

function defaultSections(snapshot: PublicWebsiteSnapshot): WebsiteSection[] {
  const sections: WebsiteSection[] = [
    {
      id: "default-hero",
      sectionKey: "home",
      sectionType: "hero",
      heading:
        snapshot.website.tagline ||
        snapshot.school.motto ||
        `Welcome to ${snapshot.school.name}`,
      subheading: snapshot.branch?.name || "Official School Website",
      body:
        snapshot.website.description ||
        snapshot.school.description ||
        "A learning community committed to knowledge, character and opportunity.",
      backgroundMedia:
        snapshot.branch?.banner ||
        snapshot.school.banner ||
        snapshot.gallery[0],
      content: {
        primaryLabel: "Explore our school",
        primaryHref: "#about",
        secondaryLabel: "Contact us",
        secondaryHref: "#contact",
      },
    },
    {
      id: "default-stats",
      sectionKey: "overview",
      sectionType: "statistics",
      heading: "Our school at a glance",
      subheading: "A connected learning community",
    },
    {
      id: "default-about",
      sectionKey: "about",
      sectionType: "about",
      heading: "About our school",
      subheading: snapshot.school.motto || "Who we are",
      body:
        snapshot.school.description ||
        snapshot.website.description ||
        `${snapshot.school.name} provides a supportive environment where learners can develop knowledge, confidence and character.`,
    },
  ];

  if (snapshot.principal) {
    sections.push({
      id: "default-principal",
      sectionKey: "leadership",
      sectionType: "principal",
      heading: "Headteacher's welcome",
      subheading: "School leadership",
      body:
        snapshot.principal.bio ||
        `Welcome to ${snapshot.school.name}. We are proud of our learners, staff and school community.`,
    });
  }

  if (snapshot.programs.length) {
    sections.push({
      id: "default-programs",
      sectionKey: "programmes",
      sectionType: "programs",
      heading: "Our programmes",
      subheading: "Learning pathways",
    });
  }

  if (snapshot.subjects.length) {
    sections.push({
      id: "default-subjects",
      sectionKey: "academics",
      sectionType: "subjects",
      heading: "Subjects we offer",
      subheading: "Academic learning",
    });
  }

  if (snapshot.organizations?.length) {
    sections.push({
      id: "default-organizations",
      sectionKey: "school-life",
      sectionType: "organizations",
      heading: "School life",
      subheading: "Departments, clubs and communities",
    });
  }

  if (snapshot.highlights?.length) {
    sections.push({
      id: "default-highlights",
      sectionKey: "highlights",
      sectionType: "highlights",
      heading: "School highlights",
      subheading: "Discover what is happening",
    });
  }

  if (snapshot.teachers.length) {
    sections.push({
      id: "default-teachers",
      sectionKey: "teachers",
      sectionType: "teachers",
      heading: "Meet our teachers",
      subheading: "Dedicated educators",
    });
  }

  if (snapshot.announcements.length) {
    sections.push({
      id: "default-announcements",
      sectionKey: "announcements",
      sectionType: "announcements",
      heading: "Latest announcements",
      subheading: "School updates",
    });
  }

  if (snapshot.events.length) {
    sections.push({
      id: "default-events",
      sectionKey: "events",
      sectionType: "events",
      heading: "Upcoming events",
      subheading: "Important dates",
    });
  }

  if (snapshot.gallery.length) {
    sections.push({
      id: "default-gallery",
      sectionKey: "gallery",
      sectionType: "gallery",
      heading: "School gallery",
      subheading: "Life at our school",
    });
  }

  sections.push({
    id: "default-contact",
    sectionKey: "contact",
    sectionType: "contact",
    heading: "Contact us",
    subheading: "We would love to hear from you",
  });

  return sections;
}

function createDefaultHomePage(snapshot: PublicWebsiteSnapshot): WebsitePage {
  return {
    id: `default-home-${snapshot.website.id}`,
    slug: "home",
    title: snapshot.website.siteName || snapshot.school.name,
    description:
      snapshot.website.seoDescription ||
      snapshot.website.description ||
      snapshot.school.description ||
      snapshot.school.motto,
    pageType: "home",
    sections: defaultSections(snapshot),
  };
}

export function resolveWebsitePage(
  snapshot: PublicWebsiteSnapshot,
  path?: string[],
): WebsitePage | null {
  const requested = requestedPageSlug(path);
  const pages = snapshot.pages ?? [];

  const existing =
    pages.find(
      (page) => normalizeSegment(page.slug || "home") === requested,
    ) ??
    (requested === "home"
      ? pages.find((page) =>
          ["", "home", "index"].includes(
            normalizeSegment(page.slug || "home"),
          ),
        )
      : null);

  if (existing) {
    return existing.sections?.length
      ? existing
      : { ...existing, sections: defaultSections(snapshot) };
  }

  return requested === "home" ? createDefaultHomePage(snapshot) : null;
}
