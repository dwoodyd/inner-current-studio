// Rate limiting for edge functions.
//
// `allow()` is an in-memory sliding window, per isolate — a fast first line of
// defence, but it does NOT hold across instances (the platform runs many).
// `allowShared()` counts in the database, so the limit is global across every
// instance. Prefer `allowShared()` for anything abuse-sensitive.

const buckets = new Map<string, number[]>();

/**
 * Returns true if the caller identified by `key` is allowed to proceed.
 * Allows at most `max` hits per `windowMs`. Per-isolate only.
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

/**
 * Cross-instance limiter backed by public.rate_limit_hit().
 * Returns true when the caller may proceed. Fails open on infrastructure
 * errors so a database hiccup can't take the whole endpoint down, but the
 * per-isolate window still applies in that case.
 */
export async function allowShared(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  // cheap local guard first: blocks the worst bursts without a round trip
  if (!allow(key, max, windowSeconds * 1000)) return false;

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return true;

  try {
    const res = await fetch(`${url}/rest/v1/rpc/rate_limit_hit`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _key: key, _max: max, _window_seconds: windowSeconds }),
    });
    if (!res.ok) return true;
    return (await res.json()) === true;
  } catch {
    return true;
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown'
  );
}
