import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublishedWebsite,
  resolveWebsitePage,
} from "@/app/lib/websites/api";
import WebsiteRenderer from "@/app/lib/websites/WebsiteRenderer";

import "@/app/lib/websites/website.css";

type PageProps = {
  params: Promise<{
    slug: string;
    path?: string[];
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, path } = await params;
  const payload = await getPublishedWebsite(slug).catch(() => null);

  if (!payload) {
    return {
      title: "School website unavailable",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const page = resolveWebsitePage(payload, path);
  if (!page) {
    return {
      title: "Page not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { dataset } = payload;
  const siteTitle =
    dataset.website.seoTitle ||
    dataset.website.siteName ||
    dataset.school.name;

  return {
    title:
      page.slug === "home"
        ? siteTitle
        : `${page.title} | ${siteTitle}`,
    description:
      page.description ||
      dataset.website.seoDescription ||
      dataset.website.description ||
      dataset.school.description ||
      dataset.school.motto,
    robots:
      dataset.website.status === "published"
        ? { index: true, follow: true }
        : { index: false, follow: false },
    icons: dataset.school.logo?.url
      ? { icon: dataset.school.logo.url }
      : undefined,
    openGraph: {
      title: siteTitle,
      description:
        dataset.website.seoDescription ||
        dataset.website.description ||
        dataset.school.description,
      images:
        dataset.school.banner?.url || dataset.school.logo?.url
          ? [
              {
                url:
                  dataset.school.banner?.url ||
                  dataset.school.logo?.url ||
                  "",
              },
            ]
          : undefined,
    },
  };
}

export default async function SchoolWebsitePage({
  params,
}: PageProps) {
  const { slug, path } = await params;
  const payload = await getPublishedWebsite(slug).catch(() => null);

  if (!payload) notFound();

  const page = resolveWebsitePage(payload, path);
  if (!page) notFound();

  return (
    <WebsiteRenderer
      dataset={payload.dataset}
      settings={payload.templateSettings}
    />
  );
}
