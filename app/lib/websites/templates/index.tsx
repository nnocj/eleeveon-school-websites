import React from "react";
import { SectionRenderer, SiteChrome } from "../components";
import type { WebsiteTemplateProps } from "../types";

function StandardTemplate({ snapshot, page, templateClass }: WebsiteTemplateProps & { templateClass: string }) {
  return (
    <div className={templateClass} style={{ "--ews-primary": snapshot.theme.primaryColor || "#2f6fed", "--ews-secondary": snapshot.theme.secondaryColor || "#14213d", "--ews-accent": snapshot.theme.accentColor || "#f59e0b", "--ews-font": snapshot.theme.fontFamily || "Arial, Helvetica, sans-serif" } as React.CSSProperties}>
      <SiteChrome snapshot={snapshot}>
        {page.sections.length ? page.sections.map((section, index) => <SectionRenderer key={section.id || `${section.sectionKey}-${index}`} section={section} snapshot={snapshot} />) : <section className="ews-section"><div className="ews-shell ews-empty-page"><h1>{page.title}</h1><p>{page.description || "This page is published and ready for content."}</p></div></section>}
      </SiteChrome>
    </div>
  );
}

export function ModernAcademyTemplate(props: WebsiteTemplateProps) { return <StandardTemplate {...props} templateClass="ews-template ews-modern-academy" />; }
export function ClassicSchoolTemplate(props: WebsiteTemplateProps) { return <StandardTemplate {...props} templateClass="ews-template ews-classic-school" />; }
export function BoldCampusTemplate(props: WebsiteTemplateProps) { return <StandardTemplate {...props} templateClass="ews-template ews-bold-campus" />; }
