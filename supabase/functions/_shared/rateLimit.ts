// Simple in-memory sliding-window rate limiter for edge functions.
// Per-isolation: each edge-function instance keeps its own counters, which is
// enough to blunt bursts (the platform also applies its own global limits).

const buckets = new Map<string, number[]>();

/**
 * Returns true if the caller identified by `key` is allowed to proceed.
 * Allows at most `max` hits per `windowMs`.
 */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = buckets.get(key) ?? [];
  const fresh = hits.filter((t) => now - t < windowMs);
  if (fresh.length >= max) {
    buckets.set(key, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(key, fresh);
  // opportunistic cleanup so the map can't grow unbounded
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}
