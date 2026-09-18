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

const STEPS = [
  { emoji: "🔍", text: "Weeks 1–2: pick a real problem and scope one core flow." },
  { emoji: "🎨", text: "Weeks 3–4: design it, test it with people, fix what confuses them." },
  { emoji: "🚀", text: "Weeks 5–8: build it with any tool you can ship with, then get it used." },
  { emoji: "📽️", text: "Weeks 9–12: turn the journey into a case study deck and launch both." },
];

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
        className="sheet-enter relative w-full max-w-sm rounded-t-3xl border border-border bg-panel p-6 pb-8 shadow-xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" />

        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">You&apos;re in</p>
        <h2 id="welcome-title" className="mt-2 font-heading text-2xl text-ink">
          Welcome to the Winter Arc 👋
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {durationWeeks} weeks, one small task a day, and two things to show for it at the end: a
          product you shipped and a case study that tells its story. Today is Day 1.
        </p>

        <ul className="mt-5 space-y-3">
          {STEPS.map((s) => (
            <li key={s.text} className="flex gap-3 text-sm text-ink-muted">
              <span aria-hidden="true" className="shrink-0 text-lg leading-none">
                {s.emoji}
              </span>
              <span>{s.text}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-2xl bg-page px-4 py-3 text-xs leading-relaxed text-ink-muted">
          Tick tasks in the <strong className="text-ink">Daily</strong> tab, ship the week&apos;s
          deliverable in <strong className="text-ink">Weekly</strong>, and share your work along the
          way, the conversations are half the point.
        </p>

        <div className="mt-6 flex flex-col gap-2">
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
