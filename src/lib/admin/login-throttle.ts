import "server-only";

// In-memory, per-instance. Good enough to make guessing impractical for a
// single admin account; a shared store would only matter at a scale this
// app doesn't have.
const attempts = new Map<string, { count: number; blockedUntil: number }>();

const MAX_FREE_ATTEMPTS = 5;
const BASE_DELAY_MS = 30_000;
const MAX_DELAY_MS = 15 * 60_000;
const FORGET_AFTER_MS = 60 * 60_000;

function prune(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.blockedUntil + FORGET_AFTER_MS < now) attempts.delete(key);
  }
}

/** Seconds the caller must wait before another attempt, or 0 if allowed. */
export function loginRetryAfter(key: string, now = Date.now()): number {
  const entry = attempts.get(key);
  if (!entry || entry.blockedUntil <= now) return 0;
  return Math.ceil((entry.blockedUntil - now) / 1000);
}

export function recordFailedLogin(key: string, now = Date.now()) {
  prune(now);
  const entry = attempts.get(key) ?? { count: 0, blockedUntil: 0 };
  entry.count += 1;
  if (entry.count > MAX_FREE_ATTEMPTS) {
    const delay = Math.min(BASE_DELAY_MS * 2 ** (entry.count - MAX_FREE_ATTEMPTS - 1), MAX_DELAY_MS);
    entry.blockedUntil = now + delay;
  }
  attempts.set(key, entry);
}

export function clearFailedLogins(key: string) {
  attempts.delete(key);
}
