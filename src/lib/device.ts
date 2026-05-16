import { cookies } from "next/headers";
import { db, devices } from "@/db";
import { sql } from "drizzle-orm";

const COOKIE_NAME = "ap_did";
const TWO_YEARS = 60 * 60 * 24 * 365 * 2;

export async function getDeviceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function ensureDevice(): Promise<string | null> {
  const cookieStore = await cookies();
  let id = cookieStore.get(COOKIE_NAME)?.value ?? null;

  if (!id) {
    id = crypto.randomUUID();
    try {
      cookieStore.set({
        name: COOKIE_NAME,
        value: id,
        path: "/",
        maxAge: TWO_YEARS,
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    } catch (e) {
      console.error("[ensureDevice cookies.set]", e);
    }
  }

  try {
    await db
      .insert(devices)
      .values({ id })
      .onConflictDoUpdate({
        target: devices.id,
        set: { lastSeenAt: sql`now()` },
      });
  } catch (e) {
    console.error("[ensureDevice insert]", e);
    return null;
  }
  return id;
}
