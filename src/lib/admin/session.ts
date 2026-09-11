import "server-only";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
  type AdminSession,
} from "./session-token";

export async function getAdminSession(): Promise<AdminSession | null> {
  return verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Only callable from a Server Function or Route Handler, cookies can't be set during render. */
export async function setAdminSessionCookie(username: string) {
  (await cookies()).set(ADMIN_COOKIE, createSessionToken(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  (await cookies()).delete(ADMIN_COOKIE);
}
