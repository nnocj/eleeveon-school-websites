import React from "react";
import type {
  PublicWebsiteSnapshot,
  WebsiteItem,
  WebsiteMedia,
  WebsiteNavigationLink,
  WebsitePerson,
  WebsiteSection,
} from "./types";

export function MediaImage({
  media,
  className,
  eager = false,
}: {
  media?: WebsiteMedia;
  className?: string;
  eager?: boolean;
}) {
  if (!media?.url) return null;
  return (
    <img
      className={className}
      src={media.url}
      alt={media.alt || ""}
      loading={eager ? "eager" : "lazy"}
    />
  );
}

function dateLabel(value?: number) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return undefined;
  return new Intl.DateTimeFormat("en-GH", { dateStyle: "medium" }).format(date);
}

function ItemsGrid({
  items = [],
  empty,
}: {
  items?: WebsiteItem[];
  empty: string;
}) {
  if (!items.length) return <p className="ews-empty">{empty}</p>;
  return (
    <div className="ews-card-grid">
      {items.map((item, index) => (
        <article className="ews-card" key={item.id || `${item.title}-${index}`}>
          <MediaImage media={item.media} className="ews-card-image" />
          <div className="ews-card-body">
            {item.startsAt ? (
              <small>{dateLabel(item.startsAt)}</small>
            ) : item.subtitle ? (
              <small>{item.subtitle}</small>
            ) : null}
            <h3>{item.title}</h3>
            {item.body ? <p>{item.body}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function PeopleGrid({ people }: { people: WebsitePerson[] }) {
  if (!people.length) {
    return <p className="ews-empty">Leadership and staff profiles will appear here.</p>;
  }
  return (
    <div className="ews-people-grid">
      {people.map((person, index) => (
        <article className="ews-person" key={person.id || `${person.name}-${index}`}>
          {person.photo?.url ? (
            <MediaImage media={person.photo} className="ews-person-photo" />
          ) : (
            <div className="ews-person-placeholder">{person.name.slice(0, 1)}</div>
          )}
          <h3>{person.name}</h3>
          <p className="ews-person-title">
            {person.title || person.role || "Staff member"}
          </p>
          {person.bio ? <p>{person.bio}</p> : null}
        </article>
      ))}
    </div>
  );
}

function PrincipalWelcome({
  principal,
  body,
}: {
  principal: WebsitePerson;
  body?: string;
}) {
  return (
    <div className="ews-principal">
      <div>
        {principal.photo?.url ? (
          <MediaImage media={principal.photo} className="ews-principal-photo" />
        ) : (
          <div className="ews-principal-placeholder">{principal.name.slice(0, 1)}</div>
        )}
      </div>
      <div>
        <p className="ews-quote">“</p>
        <p className="ews-principal-message">{body || principal.bio}</p>
        <h3>{principal.name}</h3>
        <p className="ews-person-title">
          {principal.title || principal.role || "Headteacher"}
        </p>
      </div>
    </div>
  );
}

function Gallery({ media }: { media: WebsiteMedia[] }) {
  if (!media.length) return <p className="ews-empty">School gallery images will appear here.</p>;
  return (
    <div className="ews-gallery">
      {media.map((image, index) => (
        <MediaImage key={image.id || index} media={image} className="ews-gallery-image" />
      ))}
    </div>
  );
}

function Statistics({ snapshot }: { snapshot: PublicWebsiteSnapshot }) {
  const stats = [
    [snapshot.stats?.students, "Students"],
    [snapshot.stats?.teachers ?? snapshot.teachers.length, "Teachers"],
    [snapshot.stats?.classes ?? snapshot.classes?.length, "Classes"],
    [snapshot.stats?.subjects ?? snapshot.subjects.length, "Subjects"],
  ].filter(([value]) => typeof value === "number" && value > 0) as [number, string][];

  if (!stats.length) return null;
  return (
    <div className="ews-stats">
      {stats.map(([value, label]) => (
        <div key={label}>
          <strong>{value.toLocaleString("en-GH")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Contact({ snapshot }: { snapshot: PublicWebsiteSnapshot }) {
  const source = snapshot.branch || snapshot.school;
  const phone = source.phone || snapshot.school.phone;
  const email = source.email || snapshot.school.email;
  const address =
    source.address ||
    source.location ||
    snapshot.school.address ||
    snapshot.school.location;

  return (
    <div className="ews-contact-wrap">
      <div className="ews-contact-grid">
        <div>
          <small>Phone</small>
          <strong>{phone || "Not provided"}</strong>
          {phone ? <a href={`tel:${phone}`}>Call school</a> : null}
        </div>
        <div>
          <small>Email</small>
          <strong>{email || "Not provided"}</strong>
          {email ? <a href={`mailto:${email}`}>Send email</a> : null}
        </div>
        <div>
          <small>Address</small>
          <strong>{address || "Not provided"}</strong>
        </div>
      </div>
    </div>
  );
}

export function SectionRenderer({
  section,
  snapshot,
}: {
  section: WebsiteSection;
  snapshot: PublicWebsiteSnapshot;
}) {
  const type = section.sectionType.toLowerCase().replace(/[\s-]+/g, "_");
  const content = section.content || {};
  const heading = section.heading || String(content.heading || "");
  const subheading = section.subheading || String(content.subheading || "");
  const body = section.body || String(content.body || content.description || "");

  if (["hero", "banner", "masthead"].includes(type)) {
    const background =
      section.backgroundMedia ||
      snapshot.branch?.banner ||
      snapshot.school.banner ||
      snapshot.gallery[0];
    return (
      <section
        className="ews-section ews-section-hero"
        id={section.sectionKey}
        style={
          background?.url
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(8,18,35,.9), rgba(8,18,35,.36)), url(${background.url})`,
              }
            : undefined
        }
      >
        <div className="ews-shell ews-hero-inner">
          <p className="ews-eyebrow">{subheading || snapshot.branch?.name || "Welcome"}</p>
          <h1>
            {heading ||
              snapshot.website.tagline ||
              snapshot.school.motto ||
              `Welcome to ${snapshot.school.name}`}
          </h1>
          {body || snapshot.school.description ? (
            <p>{body || snapshot.school.description}</p>
          ) : null}
          <div className="ews-actions">
            <a className="ews-button" href={String(content.primaryHref || "#about")}>
              {String(content.primaryLabel || "Explore our school")}
            </a>
            <a
              className="ews-button ews-button-secondary"
              href={String(content.secondaryHref || "#contact")}
            >
              {String(content.secondaryLabel || "Contact us")}
            </a>
          </div>
        </div>
      </section>
    );
  }

  let rendered: React.ReactNode;
  if (["statistics", "stats", "overview"].includes(type)) {
    rendered = <Statistics snapshot={snapshot} />;
  } else if (["teachers", "staff", "leadership", "team"].includes(type)) {
    rendered = <PeopleGrid people={snapshot.teachers} />;
  } else if (["programs", "programmes", "academics"].includes(type)) {
    rendered = (
      <ItemsGrid
        items={section.items?.length ? section.items : snapshot.programs}
        empty="Academic programmes will appear here."
      />
    );
  } else if (["subjects", "courses"].includes(type)) {
    rendered = (
      <ItemsGrid
        items={section.items?.length ? section.items : snapshot.subjects}
        empty="Subjects will appear here."
      />
    );
  } else if (["organizations", "organisations", "school_life", "clubs"].includes(type)) {
    rendered = (
      <ItemsGrid
        items={section.items?.length ? section.items : snapshot.organizations}
        empty="School departments, clubs and communities will appear here."
      />
    );
  } else if (["highlights", "portal_highlights", "campus_life"].includes(type)) {
    rendered = (
      <ItemsGrid
        items={section.items?.length ? section.items : snapshot.highlights}
        empty="School highlights will appear here."
      />
    );
  } else if (["announcements", "news", "updates"].includes(type)) {
    rendered = (
      <ItemsGrid
        items={section.items?.length ? section.items : snapshot.announcements}
        empty="There are no published announcements yet."
      />
    );
  } else if (["events", "calendar", "calendar_events"].includes(type)) {
    rendered = (
      <ItemsGrid
        items={section.items?.length ? section.items : snapshot.events}
        empty="There are no published events yet."
      />
    );
  } else if (["gallery", "media", "photos"].includes(type)) {
    rendered = <Gallery media={section.media?.length ? section.media : snapshot.gallery} />;
  } else if (["contact", "contact_details", "location"].includes(type)) {
    rendered = <Contact snapshot={snapshot} />;
  } else if (["principal", "headteacher", "welcome_message"].includes(type) && snapshot.principal) {
    rendered = <PrincipalWelcome principal={snapshot.principal} body={body} />;
  } else {
    rendered = body ? (
      <div className="ews-rich-copy">
        <p>{body}</p>
      </div>
    ) : (
      <ItemsGrid items={section.items} empty="This section is ready for content." />
    );
  }

  return (
    <section className={`ews-section ews-section-${type}`} id={section.sectionKey}>
      <div className="ews-shell">
        {heading || subheading ? (
          <header className="ews-section-heading">
            {subheading ? <p className="ews-eyebrow">{subheading}</p> : null}
            {heading ? <h2>{heading}</h2> : null}
          </header>
        ) : null}
        {rendered}
      </div>
    </section>
  );
}

function defaultNavigation(
  snapshot: PublicWebsiteSnapshot,
): WebsiteNavigationLink[] {
  const links: Array<WebsiteNavigationLink | null> = [
    {
      id: "default-home",
      label: "Home",
      href: "#home",
    },
    {
      id: "default-about",
      label: "About",
      href: "#about",
    },
    snapshot.subjects.length || snapshot.programs.length
      ? {
          id: "default-academics",
          label: "Academics",
          href: snapshot.programs.length
            ? "#programmes"
            : "#academics",
        }
      : null,
    snapshot.teachers.length
      ? {
          id: "default-teachers",
          label: "Teachers",
          href: "#teachers",
        }
      : null,
    snapshot.gallery.length
      ? {
          id: "default-gallery",
          label: "Gallery",
          href: "#gallery",
        }
      : null,
    {
      id: "default-contact",
      label: "Contact",
      href: "#contact",
    },
  ];

  return links.filter(
    (link): link is WebsiteNavigationLink => link !== null,
  );
}

export function SiteChrome({
  snapshot,
  children,
}: {
  snapshot: PublicWebsiteSnapshot;
  children: React.ReactNode;
}) {
  const logo = snapshot.branch?.logo || snapshot.school.logo;
  const contact = snapshot.branch || snapshot.school;
  const navigation = snapshot.navigation.length
    ? snapshot.navigation
    : defaultNavigation(snapshot);

  return (
    <div className="ews-site">
      <header className="ews-header">
        <div className="ews-shell ews-header-inner">
          <a className="ews-brand" href="#home">
            {logo?.url ? (
              <MediaImage media={logo} className="ews-logo" eager />
            ) : (
              <span className="ews-logo-placeholder">{snapshot.school.name.slice(0, 1)}</span>
            )}
            <span>
              <strong>{snapshot.website.siteName || snapshot.school.name}</strong>
              {snapshot.school.motto ? <small>{snapshot.school.motto}</small> : null}
            </span>
          </a>
          <nav className="ews-nav" aria-label="Main navigation">
            {navigation.map((link, index) => (
              <a
                key={link.id || index}
                href={link.href}
                target={link.openInNewTab ? "_blank" : undefined}
                rel={link.openInNewTab ? "noreferrer" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="ews-footer">
        <div className="ews-shell ews-footer-grid">
          <div className="ews-footer-brand">
            {logo?.url ? <MediaImage media={logo} className="ews-footer-logo" /> : null}
            <div>
              <strong>{snapshot.school.name}</strong>
              <p>{snapshot.school.motto || snapshot.website.tagline || ""}</p>
            </div>
          </div>
          <div>
            <p>{contact.address || contact.location || snapshot.school.address || ""}</p>
            <p>{contact.phone || snapshot.school.phone || ""}</p>
            <p>{contact.email || snapshot.school.email || ""}</p>
          </div>
        </div>
        <div className="ews-powered">Powered by Eleeveon Schools</div>
      </footer>
    </div>
  );
}