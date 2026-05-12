import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "Anatomy + Physiology").slice(0, 120);
  const system = (searchParams.get("system") ?? "Open reference").slice(0, 60);
  const color = (searchParams.get("color") ?? "#be123c").match(/^#[0-9a-fA-F]{3,8}$/)
    ? (searchParams.get("color") as string)
    : "#be123c";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fafaf9",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#52525b",
            letterSpacing: 4,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 999, background: color }} />
          {system}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 88,
            fontWeight: 700,
            color: "#18181b",
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#18181b" }}>Anatomy</div>
          <div style={{ fontSize: 40, color: color, fontWeight: 700 }}>+</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#18181b" }}>Physio</div>
          <div style={{ marginLeft: "auto", fontSize: 24, color: "#71717a" }}>
            open · CC-BY figures
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
