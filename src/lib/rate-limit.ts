import "server-only";

const buckets = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>();

export function rateLimit(key: string, max = 8, windowMs = 60_000, blockMs = 5 * 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (bucket?.blockedUntil && bucket.blockedUntil > now) {
    return { ok: false, retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000) };
  }
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > max) {
    bucket.blockedUntil = now + blockMs;
    return { ok: false, retryAfter: Math.ceil(blockMs / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}
