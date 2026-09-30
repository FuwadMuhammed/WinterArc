"use client";

import { getArcEndDate, getArcStartDate, taskProgress } from "@/lib/arc-logic";
import { useJoinArc } from "@/lib/useJoinArc";
import type { Arc, Task, TaskEntry, UserArc } from "@/lib/database.types";

const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

export function Sidebar({
  arc,
  userArc,
  tasks,
  entries,
  loggedIn,
  onOpenAuth,
}: {
  arc: Arc;
  userArc: UserArc | null;
  tasks: Task[];
  entries: TaskEntry[];
  loggedIn: boolean;
  onOpenAuth: () => void;
}) {
  const joined = userArc !== null;
  const { pending, error, handleJoinClick } = useJoinArc(loggedIn, onOpenAuth);

  const startLabel = joined
    ? getArcStartDate(userArc).toLocaleDateString("en-US", DATE_FORMAT)
    : "The day you join";
  const endLabel = joined
    ? getArcEndDate(arc, userArc).toLocaleDateString("en-US", DATE_FORMAT)
    : `${arc.duration_weeks} weeks later`;
  const connections = taskProgress(
    tasks.filter((t) => t.category === "connection"),
    entries,
  );

  return (
    <div className="space-y-6">
      {/* Above the fold for a new visitor, and first in the sidebar: the ask
          to join, with just enough context to say yes, before the details. */}
      {!joined && (
        <div className="rounded-3xl border border-border bg-panel px-6 py-6">
          <p className="font-heading text-lg text-ink">Ready to start your arc?</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            Join free and get your Day 1 tasks, no commitment beyond showing up.
          </p>
          <button
            type="button"
            onClick={handleJoinClick}
            disabled={pending}
            className="mt-4 w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Joining…" : "Join the Winter Arc"}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-center text-xs font-medium text-red">
              {error}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-faint">
            Reset progress or delete your account anytime from your profile.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-panel px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Quick facts</p>
        <dl className="mt-3 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-ink-muted">Duration</dt>
            <dd className="font-medium text-ink">{arc.duration_weeks} weeks</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-ink-muted">Starts</dt>
            <dd className="font-medium text-ink">{startLabel}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-ink-muted">Ends</dt>
            <dd className="font-medium text-ink">{endLabel}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-ink-muted">Connections made</dt>
            <dd className="font-medium text-ink">
              {joined ? connections.done : 0}
              <span className="text-ink-faint"> / {connections.total}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-3xl border border-border bg-panel px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">How it works</p>
        <ul className="mt-3 space-y-3 text-sm text-ink-muted">
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            One small task a day: pick a problem, design the flow, build it, ship it.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            Share your work and get feedback, a few real conversations every week.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
            Finish with two things: a live product and a case study deck that tells its story.
          </li>
        </ul>
      </div>
    </div>
  );
}
