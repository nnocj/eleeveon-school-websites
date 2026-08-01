export type WebsiteMedia = {
  id?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type WebsitePerson = {
  id?: string;
  name: string;
  title?: string;
  role?: string;
  bio?: string;
  email?: string;
  phone?: string;
  photo?: WebsiteMedia;
};

export type WebsiteItem = {
  id?: string;
  title: string;
  subtitle?: string;
  body?: string;
  slug?: string;
  startsAt?: number;
  endsAt?: number;
  media?: WebsiteMedia;
};

export type WebsiteSection = {
  id?: string;
  sectionKey: string;
  sectionType: string;
  variant?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  items?: WebsiteItem[];
  primaryMedia?: WebsiteMedia;
  backgroundMedia?: WebsiteMedia;
  media?: WebsiteMedia[];
};

export type WebsitePage = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  pageType?: string;
  sections: WebsiteSection[];
};

export type WebsiteNavigationLink = {
  id?: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
  children?: WebsiteNavigationLink[];
};

export type PublicWebsiteSnapshot = {
  website: {
    id: string;
    slug: string;
    status: "published";
    templateKey: string;
    siteName?: string;
    tagline?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    publishedAt?: number | string | null;
  };
  school: {
    id?: string;
    name: string;
    motto?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    location?: string;
    logo?: WebsiteMedia;
    banner?: WebsiteMedia;
  };
  branch?: {
    id?: string;
    name: string;
    code?: string;
    email?: string;
    phone?: string;
    address?: string;
    location?: string;
    city?: string;
    logo?: WebsiteMedia;
    banner?: WebsiteMedia;
  };
  principal?: WebsitePerson;
  teachers: WebsitePerson[];
  programs: WebsiteItem[];
  subjects: WebsiteItem[];
  announcements: WebsiteItem[];
  events: WebsiteItem[];
  highlights?: WebsiteItem[];
  organizations?: WebsiteItem[];
  academicStructures?: WebsiteItem[];
  classes?: WebsiteItem[];
  stats?: { students?: number; teachers?: number; classes?: number; subjects?: number; programs?: number };
  gallery: WebsiteMedia[];
  navigation: WebsiteNavigationLink[];
  pages: WebsitePage[];
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  generatedAt: number;
};

export type WebsiteTemplateProps = {
  snapshot: PublicWebsiteSnapshot;
  page: WebsitePage;
};
