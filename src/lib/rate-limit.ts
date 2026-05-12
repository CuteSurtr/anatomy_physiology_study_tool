type Bucket = { tokens: number; lastRefill: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export type RateLimitOpts = {
  windowMs: number;
  max: number;
};

export function rateLimit(key: string, opts: RateLimitOpts): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) {
      const cutoff = now - opts.windowMs * 2;
      for (const [k, b] of buckets) {
        if (b.lastRefill < cutoff) buckets.delete(k);
        if (buckets.size < MAX_BUCKETS) break;
      }
    }
    bucket = { tokens: opts.max, lastRefill: now };
    buckets.set(key, bucket);
  } else {
    const elapsed = now - bucket.lastRefill;
    const refill = (elapsed / opts.windowMs) * opts.max;
    bucket.tokens = Math.min(opts.max, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { ok: true };
  }

  const tokensNeeded = 1 - bucket.tokens;
  const retryAfterMs = Math.ceil((tokensNeeded / opts.max) * opts.windowMs);
  return { ok: false, retryAfterMs };
}
