import type React from "react";

import type {
  PublicWebsiteSnapshot,
  WebsiteItem,
  WebsiteSection,
} from "./types";

const wrap: React.CSSProperties = {
  width: "min(1120px, calc(100% - 32px))",
  margin: "0 auto",
  padding: "64px 0",
};

type SectionRendererProps = {
  section: WebsiteSection;
  site: PublicWebsiteSnapshot;
};

export default function SectionRenderer({
  section,
  site,
}: SectionRendererProps) {
  const items: WebsiteItem[] = section.items ?? [];
  const type = section.sectionType;

  if (type === "hero") {
    return (
      <section
        style={{
          ...wrap,
          minHeight: 520,
          display: "grid",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 700,
              color: site.theme.primaryColor,
            }}
          >
            {section.subheading ||
              site.branch?.name ||
              "Official School Website"}
          </p>

          <h1
            style={{
              fontSize: "clamp(42px, 8vw, 84px)",
              lineHeight: 1,
              margin: "12px 0",
            }}
          >
            {section.heading || site.school.name}
          </h1>

          <p
            style={{
              maxWidth: 700,
              fontSize: 20,
              lineHeight: 1.7,
            }}
          >
            {section.body ||
              site.school.motto ||
              site.website.tagline}
          </p>
        </div>
      </section>
    );
  }

  if (type === "gallery") {
    const media =
      section.media && section.media.length > 0
        ? section.media
        : site.gallery;

    return (
      <section style={wrap}>
        <Heading section={section} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {media.map((mediaItem, index) =>
            mediaItem.url ? (
              <img
                key={mediaItem.id ?? `${mediaItem.url}-${index}`}
                src={mediaItem.url}
                alt={mediaItem.alt ?? ""}
                style={{
                  width: "100%",
                  height: 240,
                  objectFit: "cover",
                  borderRadius: 18,
                }}
              />
            ) : null,
          )}
        </div>
      </section>
    );
  }

  if (type === "teachers" || type === "leadership") {
    const people =
      type === "leadership" && site.principal
        ? [
            site.principal,
            ...site.teachers.filter(
              (teacher) =>
                teacher.id !== site.principal?.id,
            ),
          ]
        : site.teachers;

    return (
      <section style={wrap}>
        <Heading section={section} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 18,
          }}
        >
          {people.slice(0, 8).map((person, index) => (
            <article
              key={
                person.id ??
                `${person.name}-${index}`
              }
              style={{
                padding: 20,
                border: "1px solid #e5e7eb",
                borderRadius: 18,
              }}
            >
              {person.photo?.url ? (
                <img
                  src={person.photo.url}
                  alt={person.photo.alt ?? person.name}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: 14,
                  }}
                />
              ) : null}

              <h3>{person.name}</h3>

              {person.title || person.role ? (
                <p>{person.title || person.role}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (
    [
      "announcements",
      "calendar_events",
      "programs",
      "subjects",
    ].includes(type)
  ) {
    let pool: WebsiteItem[];

    if (items.length > 0) {
      pool = items;
    } else {
      switch (type) {
        case "announcements":
          pool = site.announcements;
          break;

        case "calendar_events":
          pool = site.events;
          break;

        case "programs":
          pool = site.programs;
          break;

        case "subjects":
          pool = site.subjects;
          break;

        default:
          pool = [];
      }
    }

    return (
      <section style={wrap}>
        <Heading section={section} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {pool.map((item, index) => (
            <article
              key={
                item.id ??
                item.slug ??
                `${item.title}-${index}`
              }
              style={{
                padding: 22,
                border: "1px solid #e5e7eb",
                borderRadius: 18,
              }}
            >
              <h3>{item.title}</h3>

              {item.subtitle ? (
                <p>
                  <strong>{item.subtitle}</strong>
                </p>
              ) : null}

              {item.body ? (
                <p style={{ lineHeight: 1.7 }}>
                  {item.body}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (type === "contact") {
    return (
      <section style={wrap}>
        <Heading section={section} />

        <div
          style={{
            display: "grid",
            gap: 8,
          }}
        >
          {(site.branch?.address ||
            site.school.address) && (
            <span>
              {site.branch?.address ||
                site.school.address}
            </span>
          )}

          {(site.branch?.phone ||
            site.school.phone) && (
            <span>
              {site.branch?.phone ||
                site.school.phone}
            </span>
          )}

          {(site.branch?.email ||
            site.school.email) && (
            <span>
              {site.branch?.email ||
                site.school.email}
            </span>
          )}
        </div>
      </section>
    );
  }

  return (
    <section style={wrap}>
      <Heading section={section} />

      {section.body ? (
        <p
          style={{
            maxWidth: 800,
            fontSize: 18,
            lineHeight: 1.8,
          }}
        >
          {section.body}
        </p>
      ) : null}
    </section>
  );
}

function Heading({
  section,
}: {
  section: WebsiteSection;
}) {
  return (
    <>
      {section.heading ? (
        <h2
          style={{
            fontSize: "clamp(30px, 5vw, 48px)",
            margin: "0 0 10px",
          }}
        >
          {section.heading}
        </h2>
      ) : null}

      {section.subheading ? (
        <p
          style={{
            fontSize: 18,
            opacity: 0.7,
            margin: "0 0 28px",
          }}
        >
          {section.subheading}
        </p>
      ) : null}
    </>
  );
}