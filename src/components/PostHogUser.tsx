"use client";

import { useEffect } from "react";
import { identifyUser, resetUser } from "@/lib/analytics";

/** Keeps PostHog's identity in step with the Supabase session: identify on
 * sign-in, reset once the page renders signed-out. */
export function PostHogUser({
  userId,
  email,
  joinedAt,
}: {
  userId: string | null;
  email: string | null;
  joinedAt: string | null;
}) {
  useEffect(() => {
    if (userId) identifyUser(userId, { email, joined_at: joinedAt });
    else resetUser();
  }, [userId, email, joinedAt]);
  return null;
}
