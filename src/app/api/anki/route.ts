import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, srsCards } from "@/db";
import { ensureDevice } from "@/lib/device";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeField(s: string): string {
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const deviceId = await ensureDevice();
  if (!deviceId) {
    return new NextResponse("Missing device ID", { status: 401 });
  }

  let cards;
  try {
    cards = await db.select().from(srsCards).where(eq(srsCards.deviceId, deviceId));
  } catch (e) {
    console.error("[anki export]", e);
    return new NextResponse("Database error", { status: 500 });
  }

  const lines: string[] = [
    "#separator:Comma",
    "#html:false",
    "#tags column:5",
    ["Front", "Back", "Source", "Interval", "Tags"].join(","),
  ];

  for (const c of cards) {
    const front = c.questionKey;
    const back = `Reps ${c.repetitions} · Lapses ${c.lapses} · Last review ${c.lastReviewedAt?.toISOString() ?? "never"}`;
    const source = c.pagePath ?? "";
    const interval = String(c.interval);
    const tags = ["anatomy-site", c.pagePath?.split("/")[1] ?? ""].filter(Boolean).join(" ");
    lines.push([front, back, source, interval, tags].map(escapeField).join(","));
  }

  const body = lines.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="anatomy-anki-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
