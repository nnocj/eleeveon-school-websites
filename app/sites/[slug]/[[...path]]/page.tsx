type PageProps = {
  params: Promise<{
    slug: string;
    path?: string[];
  }>;
};

export default async function SchoolWebsitePage({
  params,
}: PageProps) {
  const { slug } = await params;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section style={{ textAlign: "center" }}>
        <p>Eleeveon School Website</p>
        <h1>{slug}</h1>
        <p>This school website is being served automatically.</p>
      </section>
    </main>
  );
}