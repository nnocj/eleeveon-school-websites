"use client";
export default function WebsiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif" }}><section style={{ maxWidth: 560, textAlign: "center" }}><p style={{ fontWeight: 800 }}>Eleeveon School Website</p><h1>We could not load this website.</h1><p>The school website service may be waking up or temporarily unavailable.</p><button onClick={reset} style={{ marginTop: 12, padding: "12px 18px", border: 0, borderRadius: 10, cursor: "pointer" }}>Try again</button></section></main>;
}
