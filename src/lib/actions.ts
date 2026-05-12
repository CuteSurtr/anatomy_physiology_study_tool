"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db, attempts, srsCards, bookmarks, syncCodes, questionStats } from "@/db";
import { ensureDevice } from "./device";
import { scheduleNext } from "./srs";
import { rateLimit } from "./rate-limit";

const PATH = z
  .string()
  .max(200)
  .regex(/^\/[a-zA-Z0-9/_\-#.~%]*$/);

const KEY = z.string().min(1).max(300);
const TITLE = z.string().max(300).optional();
const GRADE = z.enum(["again", "hard", "good", "easy"]);

const LogAttemptSchema = z.object({
  questionKey: KEY,
  pagePath: PATH.optional(),
  correct: z.boolean(),
  selectedAnswer: z.string().max(500).optional(),
});

const ReviewSchema = z.object({
  questionKey: KEY,
  pagePath: PATH.optional(),
  grade: GRADE,
});

const BookmarkSchema = z.object({
  pagePath: PATH,
  title: TITLE,
});

export type LogAttemptInput = z.input<typeof LogAttemptSchema>;
export type ReviewInput = z.input<typeof ReviewSchema>;
export type BookmarkInput = z.input<typeof BookmarkSchema>;

function fail(error: string) {
  return { ok: false as const, error };
}

async function getDeviceOrNull(): Promise<string | null> {
  try {
    return await ensureDevice();
  } catch (e) {
    console.error("[ensureDevice]", e);
    return null;
  }
}

function checkRate(action: string, deviceId: string, max: number) {
  return rateLimit(`${action}:${deviceId}`, { windowMs: 60_000, max }).ok;
}

export async function logAttempt(input: LogAttemptInput) {
  const parsed = LogAttemptSchema.safeParse(input);
  if (!parsed.success) return fail("invalid_input");

  const deviceId = await getDeviceOrNull();
  if (!deviceId) return fail("no_device");
  if (!checkRate("attempt", deviceId, 120)) return fail("rate_limited");

  try {
    await db.insert(attempts).values({
      id: crypto.randomUUID(),
      deviceId,
      questionKey: parsed.data.questionKey,
      pagePath: parsed.data.pagePath ?? null,
      correct: parsed.data.correct,
      selectedAnswer: parsed.data.selectedAnswer ?? null,
    });

    await db
      .insert(questionStats)
      .values({
        questionKey: parsed.data.questionKey,
        pagePath: parsed.data.pagePath ?? null,
        totalAttempts: 1,
        correctAttempts: parsed.data.correct ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: questionStats.questionKey,
        set: {
          totalAttempts: sql`${questionStats.totalAttempts} + 1`,
          correctAttempts: parsed.data.correct
            ? sql`${questionStats.correctAttempts} + 1`
            : questionStats.correctAttempts,
          updatedAt: sql`now()`,
        },
      });

    return { ok: true as const };
  } catch (e) {
    console.error("[logAttempt]", e);
    return fail("db_error");
  }
}

export type DayCount = { day: string; count: number };

export async function getActivityHeatmap(days = 90): Promise<DayCount[]> {
  const safeDays = Math.min(Math.max(7, Math.floor(days)), 365);
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return [];
  if (!checkRate("read", deviceId, 240)) return [];

  try {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - safeDays + 1);
    since.setUTCHours(0, 0, 0, 0);

    const rows = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${attempts.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(attempts)
      .where(and(eq(attempts.deviceId, deviceId), gte(attempts.createdAt, since)))
      .groupBy(sql`date_trunc('day', ${attempts.createdAt} at time zone 'UTC')`);

    return rows;
  } catch (e) {
    console.error("[getActivityHeatmap]", e);
    return [];
  }
}

export async function getStreak(): Promise<{ current: number; longest: number }> {
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return { current: 0, longest: 0 };
  if (!checkRate("read", deviceId, 240)) return { current: 0, longest: 0 };

  try {
    const rows = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${attempts.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
      })
      .from(attempts)
      .where(eq(attempts.deviceId, deviceId))
      .groupBy(sql`date_trunc('day', ${attempts.createdAt} at time zone 'UTC')`)
      .orderBy(sql`date_trunc('day', ${attempts.createdAt} at time zone 'UTC') desc`);

    if (rows.length === 0) return { current: 0, longest: 0 };

    const days = new Set(rows.map((r) => r.day));
    const todayKey = new Date().toISOString().slice(0, 10);
    const yesterdayKey = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    let current = 0;
    let cursor = new Date();
    if (!days.has(todayKey) && !days.has(yesterdayKey)) {
      current = 0;
    } else {
      if (!days.has(todayKey)) cursor = new Date(Date.now() - 86_400_000);
      while (days.has(cursor.toISOString().slice(0, 10))) {
        current += 1;
        cursor = new Date(cursor.getTime() - 86_400_000);
      }
    }

    let longest = 0;
    let run = 0;
    const sorted = [...days].sort();
    let prev: Date | null = null;
    for (const d of sorted) {
      const cur = new Date(d + "T00:00:00Z");
      if (prev && cur.getTime() - prev.getTime() === 86_400_000) run += 1;
      else run = 1;
      if (run > longest) longest = run;
      prev = cur;
    }
    return { current, longest };
  } catch (e) {
    console.error("[getStreak]", e);
    return { current: 0, longest: 0 };
  }
}

export async function getMastery(): Promise<{ system: string; total: number; correct: number; accuracy: number }[]> {
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return [];
  if (!checkRate("read", deviceId, 240)) return [];

  try {
    const rows = await db
      .select({
        pagePath: attempts.pagePath,
        total: sql<number>`count(*)::int`,
        correct: sql<number>`sum(case when ${attempts.correct} then 1 else 0 end)::int`,
      })
      .from(attempts)
      .where(eq(attempts.deviceId, deviceId))
      .groupBy(attempts.pagePath);

    const bySystem = new Map<string, { total: number; correct: number }>();
    for (const r of rows) {
      const path = r.pagePath ?? "";
      const m = path.match(/^\/([a-z]+)\//);
      if (!m) continue;
      const sys = m[1];
      const cur = bySystem.get(sys) ?? { total: 0, correct: 0 };
      cur.total += r.total;
      cur.correct += r.correct ?? 0;
      bySystem.set(sys, cur);
    }
    return Array.from(bySystem.entries())
      .map(([system, v]) => ({
        system,
        total: v.total,
        correct: v.correct,
        accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  } catch (e) {
    console.error("[getMastery]", e);
    return [];
  }
}

export async function getQuestionAggregate(questionKey: string) {
  const parsed = z.string().min(1).max(300).safeParse(questionKey);
  if (!parsed.success) return null;

  try {
    const [row] = await db
      .select()
      .from(questionStats)
      .where(eq(questionStats.questionKey, parsed.data))
      .limit(1);
    if (!row) return null;
    const accuracy = row.totalAttempts ? Math.round((row.correctAttempts / row.totalAttempts) * 100) : 0;
    return { total: row.totalAttempts, correct: row.correctAttempts, accuracy };
  } catch (e) {
    console.error("[getQuestionAggregate]", e);
    return null;
  }
}

function generateSyncCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += chars[b % chars.length];
  return out.slice(0, 4) + "-" + out.slice(4, 8);
}

const COOKIE_NAME = "ap_did";

export async function createSyncCode() {
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return fail("no_device");
  if (!checkRate("sync", deviceId, 10)) return fail("rate_limited");

  try {
    const code = generateSyncCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.insert(syncCodes).values({ code, deviceId, expiresAt });
    return { ok: true as const, code, expiresAt };
  } catch (e) {
    console.error("[createSyncCode]", e);
    return fail("db_error");
  }
}

export async function redeemSyncCode(input: { code: string }) {
  const parsed = z
    .object({ code: z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/i) })
    .safeParse(input);
  if (!parsed.success) return fail("invalid_input");

  const currentId = await getDeviceOrNull();
  if (!currentId) return fail("no_device");
  if (!checkRate("sync", currentId, 10)) return fail("rate_limited");

  try {
    const code = parsed.data.code.toUpperCase();
    const [row] = await db
      .select()
      .from(syncCodes)
      .where(eq(syncCodes.code, code))
      .limit(1);

    if (!row) return fail("not_found");
    if (row.consumedAt) return fail("already_used");
    if (row.expiresAt.getTime() < Date.now()) return fail("expired");

    await db
      .update(syncCodes)
      .set({ consumedAt: new Date() })
      .where(eq(syncCodes.code, code));

    const jar = await cookies();
    jar.set({
      name: COOKIE_NAME,
      value: row.deviceId,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true as const };
  } catch (e) {
    console.error("[redeemSyncCode]", e);
    return fail("db_error");
  }
}

export async function reviewCard(input: ReviewInput) {
  const parsed = ReviewSchema.safeParse(input);
  if (!parsed.success) return fail("invalid_input");

  const deviceId = await getDeviceOrNull();
  if (!deviceId) return fail("no_device");
  if (!checkRate("review", deviceId, 120)) return fail("rate_limited");

  try {
    const existing = await db
      .select()
      .from(srsCards)
      .where(and(eq(srsCards.deviceId, deviceId), eq(srsCards.questionKey, parsed.data.questionKey)))
      .limit(1);

    const current = existing[0];
    const next = scheduleNext(
      {
        interval: current?.interval ?? 0,
        easeFactor: current?.easeFactor ?? 250,
        repetitions: current?.repetitions ?? 0,
        lapses: current?.lapses ?? 0,
      },
      parsed.data.grade,
    );

    if (current) {
      await db
        .update(srsCards)
        .set({
          interval: next.interval,
          easeFactor: next.easeFactor,
          repetitions: next.repetitions,
          lapses: next.lapses,
          dueAt: next.dueAt,
          lastReviewedAt: new Date(),
        })
        .where(eq(srsCards.id, current.id));
    } else {
      await db.insert(srsCards).values({
        id: crypto.randomUUID(),
        deviceId,
        questionKey: parsed.data.questionKey,
        pagePath: parsed.data.pagePath ?? null,
        interval: next.interval,
        easeFactor: next.easeFactor,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueAt: next.dueAt,
        lastReviewedAt: new Date(),
      });
    }

    revalidatePath("/review");
    return { ok: true as const, next };
  } catch (e) {
    console.error("[reviewCard]", e);
    return fail("db_error");
  }
}

export async function getDueCards(limit = 50) {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 200);
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return [];
  if (!checkRate("read", deviceId, 240)) return [];

  try {
    return await db
      .select()
      .from(srsCards)
      .where(and(eq(srsCards.deviceId, deviceId), lte(srsCards.dueAt, new Date())))
      .orderBy(srsCards.dueAt)
      .limit(safeLimit);
  } catch (e) {
    console.error("[getDueCards]", e);
    return [];
  }
}

export async function getProgressStats() {
  const empty = { total: 0, correct: 0, accuracy: 0, dueCount: 0 };
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return empty;
  if (!checkRate("read", deviceId, 240)) return empty;

  try {
    const [agg] = await db
      .select({
        total: sql<number>`count(*)::int`,
        correct: sql<number>`sum(case when ${attempts.correct} then 1 else 0 end)::int`,
      })
      .from(attempts)
      .where(eq(attempts.deviceId, deviceId));

    const [dueAgg] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(srsCards)
      .where(and(eq(srsCards.deviceId, deviceId), lte(srsCards.dueAt, new Date())));

    const total = agg?.total ?? 0;
    const correct = agg?.correct ?? 0;
    return {
      total,
      correct,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
      dueCount: dueAgg?.count ?? 0,
    };
  } catch (e) {
    console.error("[getProgressStats]", e);
    return empty;
  }
}

export async function getRecentMisses(limit = 20) {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return [];
  if (!checkRate("read", deviceId, 240)) return [];

  try {
    return await db
      .select()
      .from(attempts)
      .where(and(eq(attempts.deviceId, deviceId), eq(attempts.correct, false)))
      .orderBy(desc(attempts.createdAt))
      .limit(safeLimit);
  } catch (e) {
    console.error("[getRecentMisses]", e);
    return [];
  }
}

export async function toggleBookmark(input: BookmarkInput) {
  const parsed = BookmarkSchema.safeParse(input);
  if (!parsed.success) return fail("invalid_input");

  const deviceId = await getDeviceOrNull();
  if (!deviceId) return fail("no_device");
  if (!checkRate("bookmark", deviceId, 60)) return fail("rate_limited");

  try {
    const existing = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.deviceId, deviceId), eq(bookmarks.pagePath, parsed.data.pagePath)))
      .limit(1);

    if (existing[0]) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      revalidatePath(parsed.data.pagePath);
      return { ok: true as const, bookmarked: false };
    }

    await db.insert(bookmarks).values({
      id: crypto.randomUUID(),
      deviceId,
      pagePath: parsed.data.pagePath,
      title: parsed.data.title ?? null,
    });
    revalidatePath(parsed.data.pagePath);
    return { ok: true as const, bookmarked: true };
  } catch (e) {
    console.error("[toggleBookmark]", e);
    return fail("db_error");
  }
}

export async function listBookmarks() {
  const deviceId = await getDeviceOrNull();
  if (!deviceId) return [];
  if (!checkRate("read", deviceId, 240)) return [];

  try {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.deviceId, deviceId))
      .orderBy(desc(bookmarks.createdAt));
  } catch (e) {
    console.error("[listBookmarks]", e);
    return [];
  }
}

export async function isBookmarked(pagePath: string): Promise<boolean> {
  const parsed = PATH.safeParse(pagePath);
  if (!parsed.success) return false;

  const deviceId = await getDeviceOrNull();
  if (!deviceId) return false;
  if (!checkRate("read", deviceId, 240)) return false;

  try {
    const rows = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(and(eq(bookmarks.deviceId, deviceId), eq(bookmarks.pagePath, parsed.data)))
      .limit(1);
    return rows.length > 0;
  } catch (e) {
    console.error("[isBookmarked]", e);
    return false;
  }
}
