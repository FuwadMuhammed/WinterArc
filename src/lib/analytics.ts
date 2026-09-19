"use client";

/**
 * Thin wrapper over the PostHog snippet loaded in `components/PostHog.tsx`.
 * Every call is a no-op when analytics is disabled (no key) or the script
 * hasn't loaded yet, so callers never need to guard.
 */

type PostHogClient = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (id: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  get_distinct_id?: () => string;
};

declare global {
  interface Window {
    posthog?: PostHogClient;
  }
}

function client(): PostHogClient | undefined {
  if (typeof window === "undefined") return undefined;
  const ph = window.posthog;
  // Only trust a real client (or the snippet's queue stub), never some other
  // global that happens to share the name.
  return typeof ph?.capture === "function" ? ph : undefined;
}

export type AnalyticsEvent =
  | "arc_joined"
  | "task_completed"
  | "task_uncompleted"
  | "proof_submitted"
  | "share_prompt_shown"
  | "share_clicked"
  | "resume_jump"
  | "progress_reset"
  | "account_deleted";

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  client()?.capture(event, properties);
}

/** Ties the anonymous session to the signed-in member so replays, funnels
 * and person profiles line up across devices. Safe to call on every render. */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  const ph = client();
  if (!ph || ph.get_distinct_id?.() === userId) return;
  ph.identify(userId, properties);
}

/** On sign-out, so the next visitor on this device isn't attributed to the
 * previous member. */
export function resetUser() {
  client()?.reset();
}
