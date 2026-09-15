"use client";

import { useEffect, useRef, useState } from "react";
import { entryFor, getConnectionProgress, getCurrentWeek, isArcFinished } from "@/lib/arc-logic";
import { TaskCard } from "@/components/home/TaskCard";
import { BlurredTeaser } from "@/components/home/BlurredTeaser";
import { ShareModal } from "@/components/home/ShareModal";
import { ArcFinishedNotice } from "@/components/home/ArcFinishedNotice";
import { weeklyShareText } from "@/lib/constants";
import type { Arc, Task, TaskEntry, UserArc, Week } from "@/lib/database.types";

export function WeeklyTab({
  arc,
  weeks,
  tasks,
  entries,
  userArc,
  onOpenAuth,
}: {
  arc: Arc;
  weeks: Week[];
  tasks: Task[];
  entries: TaskEntry[];
  userArc: UserArc | null;
  onOpenAuth: () => void;
}) {
  const joined = userArc !== null;
  const finished = joined && isArcFinished(arc, userArc);
  const locked = !joined || finished;
  const weekNumber = getCurrentWeek(arc, userArc);
  const week = weeks.find((w) => w.week_number === weekNumber);
  const weekTasks = tasks.filter((t) => t.week_number === weekNumber);

  const deliverables = weekTasks.filter((t) => t.day_number === null);
  const completedDeliverables = joined
    ? deliverables.filter((t) => entryFor(entries, t.id)?.completed).length
    : 0;
  const [shareOpen, setShareOpen] = useState(false);
  const prevCompletedRef = useRef(completedDeliverables);

  useEffect(() => {
    if (completedDeliverables > prevCompletedRef.current) setShareOpen(true);
    prevCompletedRef.current = completedDeliverables;
  }, [completedDeliverables]);

  if (week?.is_rest_week) {
    return (
      <div className="rounded-3xl border border-border bg-panel px-6 py-12 text-center">
        <p className="font-heading text-2xl text-ink">🌙 Rest Week</p>
        <p className="mt-2 text-sm text-ink-muted">
          No weekly deliverable, and no connection goal, just breathe.
        </p>
      </div>
    );
  }

  const connection = getConnectionProgress(weekTasks, entries, week?.connection_goal ?? null);
  const visibleCount = Math.min(2, deliverables.length);
  const visible = deliverables.slice(0, visibleCount);
  const hidden = deliverables.slice(visibleCount);

  return (
    <div className="space-y-4">
      {finished && <ArcFinishedNotice />}
      <div className="rounded-3xl border border-border bg-panel px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Connection goal - Week {weekNumber}
        </p>
        <p className="mt-2 font-heading text-4xl text-ink">
          {connection.done}
          <span className="text-lg text-ink-faint"> / {connection.goal}</span>
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {weekNumber === 1
            ? "Only 1 of the week's 6 connection prompts is needed, pick whichever feels natural."
            : "Complete this many of the week's connection prompts (Daily tab) to hit the goal."}
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-panel">
        <div className="px-6 py-4">
          <p className="text-sm font-semibold text-ink">Week {weekNumber} deliverables</p>
        </div>
        {deliverables.length === 0 ? (
          <p className="px-6 pb-5 text-sm text-ink-muted">Nothing due this week.</p>
        ) : (
          <div className="space-y-2 px-4 pb-4">
            {visible.map((t, i) => (
              <TaskCard key={t.id} task={t} entry={entryFor(entries, t.id)} index={i} readOnly={locked} />
            ))}
            {hidden.length > 0 &&
              (joined ? (
                hidden.map((t, i) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    entry={entryFor(entries, t.id)}
                    index={visible.length + i}
                    readOnly={locked}
                  />
                ))
              ) : (
                <BlurredTeaser message="Join to see the rest" onJoinClick={onOpenAuth}>
                  <div className="space-y-2">
                    {hidden.map((t, i) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        entry={entryFor(entries, t.id)}
                        index={visible.length + i}
                        readOnly={locked}
                      />
                    ))}
                  </div>
                </BlurredTeaser>
              ))}
          </div>
        )}
      </div>

      <ShareModal
        key={weekNumber}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        heading={`Week ${weekNumber} deliverable shipped!`}
        message="You just shipped this week's deliverable. Share your progress and inspire someone else to start."
        shareText={weeklyShareText(arc.name, weekNumber)}
      />
    </div>
  );
}
