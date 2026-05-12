import { cookies } from "next/headers";
import { db, devices } from "@/db";
import { sql } from "drizzle-orm";

const COOKIE_NAME = "ap_did";

export async function getDeviceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function ensureDevice(): Promise<string | null> {
  const id = await getDeviceId();
  if (!id) return null;

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
