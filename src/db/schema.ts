import { pgTable, text, integer, timestamp, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";

export const devices = pgTable("devices", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
});

export const attempts = pgTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    questionKey: text("question_key").notNull(),
    pagePath: text("page_path"),
    correct: boolean("correct").notNull(),
    selectedAnswer: text("selected_answer"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("attempts_device_idx").on(t.deviceId, t.createdAt),
    index("attempts_question_idx").on(t.questionKey),
  ],
);

export const srsCards = pgTable(
  "srs_cards",
  {
    id: text("id").primaryKey(),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    questionKey: text("question_key").notNull(),
    pagePath: text("page_path"),
    interval: integer("interval").notNull().default(0),
    easeFactor: integer("ease_factor").notNull().default(250),
    repetitions: integer("repetitions").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("srs_device_question_unq").on(t.deviceId, t.questionKey),
    index("srs_due_idx").on(t.deviceId, t.dueAt),
  ],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    pagePath: text("page_path").notNull(),
    title: text("title"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("bookmark_device_path_unq").on(t.deviceId, t.pagePath)],
);

export const syncCodes = pgTable(
  "sync_codes",
  {
    code: text("code").primaryKey(),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
  },
  (t) => [index("sync_codes_expires_idx").on(t.expiresAt)],
);

export const questionStats = pgTable(
  "question_stats",
  {
    questionKey: text("question_key").primaryKey(),
    pagePath: text("page_path"),
    totalAttempts: integer("total_attempts").notNull().default(0),
    correctAttempts: integer("correct_attempts").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export type Device = typeof devices.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type SrsCard = typeof srsCards.$inferSelect;
export type NewSrsCard = typeof srsCards.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type SyncCode = typeof syncCodes.$inferSelect;
export type QuestionStats = typeof questionStats.$inferSelect;
