"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinArcAction } from "@/lib/actions";
import { getArcEndDate, getArcStartDate, taskProgress } from "@/lib/arc-logic";
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
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const joined = userArc !== null;

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

  function handleJoinClick() {
    if (loggedIn) {
      startTransition(async () => {
        await joinArcAction();
        router.refresh();
      });
    } else {
      onOpenAuth();
    }
  }

  return (
    <div className="space-y-6">
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

      {!joined && (
        <div>
          <button
            type="button"
            onClick={handleJoinClick}
            disabled={pending}
            className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-white transition-check hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Joining…" : "Join the Winter Arc"}
          </button>
          <p className="mt-3 text-center text-xs text-ink-faint">
            Reset progress or delete your account anytime from your profile.
          </p>
        </div>
      )}
    </div>
  );
}
