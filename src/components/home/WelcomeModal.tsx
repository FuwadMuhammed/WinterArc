"use client";

import { useEffect, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "winterarc:welcomed:";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function hasSeen(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return true;
  }
}

/** Once-per-device flag. The server snapshot says "seen" so SSR never
 * renders the sheet and hydration stays clean. */
export function useWelcomeSeen(userArcId: string | null) {
  const key = `${STORAGE_PREFIX}${userArcId ?? ""}`;
  const seen = useSyncExternalStore(
    subscribe,
    () => (userArcId ? hasSeen(key) : true),
    () => true,
  );
  function markSeen() {
    try {
      localStorage.setItem(key, "1");
    } catch {
      // Private mode etc.; the sheet just won't be remembered as dismissed.
    }
    listeners.forEach((cb) => cb());
  }
  return { seen, markSeen };
}

const STEP_BG: Record<string, string> = {
  purple: "bg-purple-soft",
  green: "bg-green-soft",
  orange: "bg-orange-soft",
  blue: "bg-blue-soft",
};

const STEPS = [
  {
    emoji: "🔍",
    accent: "purple",
    range: "Weeks 1–2",
    text: "Pick a real problem and scope one core flow.",
  },
  {
    emoji: "🎨",
    accent: "green",
    range: "Weeks 3–4",
    text: "Design it, test it with people, fix what confuses them.",
  },
  {
    emoji: "🚀",
    accent: "orange",
    range: "Weeks 5–8",
    text: "Build it with any tool you can ship with, then get it used.",
  },
  {
    emoji: "📽️",
    accent: "blue",
    range: "Weeks 9–12",
    text: "Turn the journey into a case study deck and launch both.",
  },
] as const;

export function WelcomeModal({
  open,
  durationWeeks,
  onStart,
  onClose,
}: {
  open: boolean;
  durationWeeks: number;
  onStart: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="backdrop-enter fixed inset-0 bg-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="sheet-enter relative flex max-h-[min(720px,90vh)] w-full max-w-sm flex-col rounded-t-3xl border border-border bg-panel shadow-xl sm:rounded-3xl"
      >
        <div className="mx-auto mb-1 mt-3 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <div className="overflow-y-auto px-6 pb-2 pt-6 sm:pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">You&apos;re in</p>
          <h2 id="welcome-title" className="mt-2 font-heading text-2xl text-ink">
            Welcome to the Winter Arc 👋
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {durationWeeks} weeks, one small task a day, two things to show for it at the end: a
            product you shipped, and a case study that tells its story.
          </p>

          <ol className="mt-5">
            {STEPS.map((s, i) => (
              <li key={s.range} className="relative flex gap-3.5 pb-4 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[17px] top-9 h-[calc(100%-1.5rem)] w-px bg-border"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-base ${STEP_BG[s.accent]}`}
                >
                  {s.emoji}
                </span>
                <div className="min-w-0 pt-1">
                  <p className="text-sm font-semibold text-ink">{s.range}</p>
                  <p className="mt-0.5 text-sm leading-snug text-ink-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-5 rounded-2xl bg-page px-4 py-3 text-xs leading-relaxed text-ink-muted">
            Today is <strong className="text-ink">Day 1</strong>. Tick tasks in{" "}
            <strong className="text-ink">Daily</strong>, ship the week&apos;s deliverable in{" "}
            <strong className="text-ink">Weekly</strong>, and share your work along the way, the
            conversations are half the point.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 px-6 pb-6 pt-4 sm:pb-6">
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-check hover:opacity-90"
          >
            Start Day 1
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full py-3 text-sm font-medium text-ink-muted transition-check hover:text-ink"
          >
            Look around first
          </button>
        </div>
      </div>
    </div>
  );
}
