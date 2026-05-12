import { describe, expect, it } from "vitest";
import { scheduleNext } from "./srs";

const FRESH = { interval: 0, easeFactor: 250, repetitions: 0, lapses: 0 };

describe("scheduleNext", () => {
  it("resets a new card with 'again' to interval 1, lapses=1, reps=0", () => {
    const next = scheduleNext(FRESH, "again");
    expect(next.interval).toBe(1);
    expect(next.lapses).toBe(1);
    expect(next.repetitions).toBe(0);
    expect(next.easeFactor).toBe(230);
  });

  it("never drops easeFactor below 130", () => {
    let state = { ...FRESH, easeFactor: 140 };
    for (let i = 0; i < 10; i++) state = scheduleNext(state, "again");
    expect(state.easeFactor).toBe(130);
  });

  it("'good' on a fresh card → interval 1, reps=1", () => {
    const next = scheduleNext(FRESH, "good");
    expect(next.interval).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.easeFactor).toBe(250);
  });

  it("'good' on a second-rep card → interval 6", () => {
    const next = scheduleNext({ ...FRESH, repetitions: 1, interval: 1 }, "good");
    expect(next.interval).toBe(6);
    expect(next.repetitions).toBe(2);
  });

  it("'good' on a mature card scales by ease factor", () => {
    const state = { interval: 10, easeFactor: 250, repetitions: 5, lapses: 0 };
    const next = scheduleNext(state, "good");
    expect(next.interval).toBe(25);
  });

  it("'easy' bonus makes intervals longer than 'good'", () => {
    const state = { interval: 10, easeFactor: 250, repetitions: 5, lapses: 0 };
    const good = scheduleNext(state, "good");
    const easy = scheduleNext(state, "easy");
    expect(easy.interval).toBeGreaterThan(good.interval);
    expect(easy.easeFactor).toBe(state.easeFactor + 15);
  });

  it("'hard' reduces easeFactor and keeps interval short", () => {
    const state = { interval: 10, easeFactor: 250, repetitions: 5, lapses: 0 };
    const next = scheduleNext(state, "hard");
    expect(next.interval).toBe(12);
    expect(next.easeFactor).toBe(235);
    expect(next.repetitions).toBe(6);
  });

  it("dueAt is in the future by exactly interval days", () => {
    const before = Date.now();
    const next = scheduleNext(FRESH, "good");
    const after = Date.now();
    const diffMs = next.dueAt.getTime() - before;
    const oneDayMs = 24 * 60 * 60 * 1000;
    expect(diffMs).toBeGreaterThanOrEqual(oneDayMs - 1000);
    expect(diffMs).toBeLessThanOrEqual(oneDayMs + (after - before) + 1000);
  });

  it("lapse count accumulates only on 'again'", () => {
    let state = { ...FRESH };
    state = scheduleNext(state, "good");
    state = scheduleNext(state, "hard");
    state = scheduleNext(state, "easy");
    expect(state.lapses).toBe(0);
    state = scheduleNext(state, "again");
    expect(state.lapses).toBe(1);
  });

  it("'again' lowers ease and resets repetitions on a mature card", () => {
    const state = { interval: 20, easeFactor: 280, repetitions: 8, lapses: 1 };
    const next = scheduleNext(state, "again");
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBe(260);
    expect(next.lapses).toBe(2);
  });
});
