export type Grade = "again" | "hard" | "good" | "easy";

export type SrsState = {
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  dueAt: Date;
};

const MIN_EASE = 130;
const HARD_INTERVAL_MULT = 1.2;
const EASY_BONUS = 1.3;

export function scheduleNext(state: Pick<SrsState, "interval" | "easeFactor" | "repetitions" | "lapses">, grade: Grade): SrsState {
  let { interval, easeFactor, repetitions, lapses } = state;

  if (grade === "again") {
    repetitions = 0;
    lapses += 1;
    interval = 1;
    easeFactor = Math.max(MIN_EASE, easeFactor - 20);
  } else if (grade === "hard") {
    interval = Math.max(1, Math.round(interval * HARD_INTERVAL_MULT));
    easeFactor = Math.max(MIN_EASE, easeFactor - 15);
    repetitions += 1;
  } else if (grade === "good") {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.max(1, Math.round(interval * (easeFactor / 100)));
    repetitions += 1;
  } else {
    if (repetitions === 0) interval = 4;
    else interval = Math.max(1, Math.round(interval * (easeFactor / 100) * EASY_BONUS));
    easeFactor = easeFactor + 15;
    repetitions += 1;
  }

  const dueAt = new Date();
  dueAt.setUTCDate(dueAt.getUTCDate() + interval);

  return { interval, easeFactor, repetitions, lapses, dueAt };
}
