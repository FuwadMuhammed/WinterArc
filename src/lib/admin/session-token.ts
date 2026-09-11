// Pure token helpers shared by the proxy and server code. No Next imports here
// so the proxy can verify cookies without pulling in next/headers.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AdminSession = { u: string; exp: number };

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters");
  }
  return s;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionToken(username: string, now = Date.now()): string {
  const payload: AdminSession = { u: username, exp: now + SESSION_TTL_SECONDS * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Returns the payload for a well-signed, unexpired token, otherwise null. */
export function verifySessionToken(token: string | undefined, now = Date.now()): AdminSession | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  let expected: Buffer;
  try {
    expected = Buffer.from(sign(body));
  } catch {
    return null; // secret not configured
  }
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as AdminSession;
    if (typeof payload.u !== "string" || typeof payload.exp !== "number") return null;
    return payload.exp > now ? payload : null;
  } catch {
    return null;
  }
}

/** Constant-time string compare. Hashing both sides first means
 * timingSafeEqual never throws on length mismatch and length isn't leaked. */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
