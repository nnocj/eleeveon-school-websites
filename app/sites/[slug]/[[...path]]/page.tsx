import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedWebsite, resolveWebsitePage, WebsiteRenderer } from "@/app/lib/websites";
import "@/app/lib/websites/website.css";

type PageProps = {
  params: Promise<{ slug: string; path?: string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, path } = await params;
  const snapshot = await getPublishedWebsite(slug).catch(() => null);
  if (!snapshot) return { title: "School website unavailable" };
  const page = resolveWebsitePage(snapshot, path);
  const siteTitle = snapshot.website.seoTitle || snapshot.website.siteName || snapshot.school.name;
  return {
    title: page && page.slug !== "home" ? `${page.title} | ${siteTitle}` : siteTitle,
    description: page?.description || snapshot.website.seoDescription || snapshot.school.description || snapshot.school.motto,
    robots: snapshot.website.status === "published" ? { index: true, follow: true } : { index: false, follow: false },
    icons: snapshot.school.logo?.url ? { icon: snapshot.school.logo.url } : undefined,
  };
}

export default async function SchoolWebsitePage({ params }: PageProps) {
  const { slug, path } = await params;
  const snapshot = await getPublishedWebsite(slug);
  if (!snapshot) notFound();
  const page = resolveWebsitePage(snapshot, path);
  if (!page) notFound();
  return <WebsiteRenderer snapshot={snapshot} page={page} />;
}
