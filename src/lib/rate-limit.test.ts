import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows max requests within window", () => {
    const key = `t-${Date.now()}-allow`;
    const opts = { windowMs: 60_000, max: 3 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
  });

  it("denies after exceeding max", () => {
    const key = `t-${Date.now()}-deny`;
    const opts = { windowMs: 60_000, max: 2 };
    rateLimit(key, opts);
    rateLimit(key, opts);
    const result = rateLimit(key, opts);
    expect(result.ok).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("keys are isolated", () => {
    const opts = { windowMs: 60_000, max: 1 };
    expect(rateLimit("ka", opts).ok).toBe(true);
    expect(rateLimit("kb", opts).ok).toBe(true);
    expect(rateLimit("ka", opts).ok).toBe(false);
    expect(rateLimit("kb", opts).ok).toBe(false);
  });
});
