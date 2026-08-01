import { BoldCampusTemplate, ClassicSchoolTemplate, ModernAcademyTemplate } from "./templates";
import type { WebsiteTemplateProps } from "./types";

const registry = {
  modern_academy: ModernAcademyTemplate,
  "modern-academy": ModernAcademyTemplate,
  classic_school: ClassicSchoolTemplate,
  "classic-school": ClassicSchoolTemplate,
  bold_campus: BoldCampusTemplate,
  "bold-campus": BoldCampusTemplate,
} as const;

export function WebsiteRenderer(props: WebsiteTemplateProps) {
  const key = props.snapshot.website.templateKey as keyof typeof registry;
  const Template = registry[key] || ModernAcademyTemplate;
  return <Template {...props} />;
}
