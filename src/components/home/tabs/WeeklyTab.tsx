"use client";

import { useEffect, useRef, useState } from "react";
import { entryFor, getCurrentWeek, getWeekDateRange, isArcFinished } from "@/lib/arc-logic";
import { TaskCard } from "@/components/home/TaskCard";
import { BlurredTeaser } from "@/components/home/BlurredTeaser";
import { ShareModal } from "@/components/home/ShareModal";
import { ArcFinishedNotice } from "@/components/home/ArcFinishedNotice";
import { WeekNav } from "@/components/home/WeekNav";
import { NextWeekNotice } from "@/components/home/NextWeekNotice";
import { weeklyShareText } from "@/lib/constants";
import type { Arc, Task, TaskEntry, UserArc, Week } from "@/lib/database.types";

export function WeeklyTab({
  arc,
  weeks,
  tasks,
  entries,
  userArc,
  selectedWeek,
  onSelectWeek,
  onOpenAuth,
}: {
  arc: Arc;
  weeks: Week[];
  tasks: Task[];
  entries: TaskEntry[];
  userArc: UserArc | null;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  onOpenAuth: () => void;
}) {
  const joined = userArc !== null;
  const finished = joined && isArcFinished(arc, userArc);
  const locked = !joined || finished;
  const currentWeek = getCurrentWeek(arc, userArc);
  const weekNumber = selectedWeek;
  const week = weeks.find((w) => w.week_number === weekNumber);
  const weekTasks = tasks.filter((t) => t.week_number === weekNumber);

  const deliverables = weekTasks.filter((t) => t.day_number === null);
  const completedDeliverables = joined
    ? deliverables.filter((t) => entryFor(entries, t.id)?.completed).length
    : 0;
  const [shareOpen, setShareOpen] = useState(false);
  const prevCompletedRef = useRef(completedDeliverables);
  const prevWeekRef = useRef(weekNumber);

  useEffect(() => {
    // Switching weeks changes the count too; only a real completion in the
    // same week should open the share prompt.
    if (prevWeekRef.current === weekNumber && completedDeliverables > prevCompletedRef.current) {
      setShareOpen(true);
    }
    prevWeekRef.current = weekNumber;
    prevCompletedRef.current = completedDeliverables;
  }, [completedDeliverables, weekNumber]);

  const unlockDate =
    joined && weekNumber < arc.duration_weeks ? getWeekDateRange(userArc, weekNumber + 1).start : undefined;
  const nav = joined && (
    <WeekNav
      selectedWeek={weekNumber}
      currentWeek={currentWeek}
      durationWeeks={arc.duration_weeks}
      onChange={onSelectWeek}
      dateRange={getWeekDateRange(userArc, weekNumber)}
      unlockDate={unlockDate}
    />
  );
  const weekDone = joined && weekTasks.every((t) => entryFor(entries, t.id)?.completed);
  const notice = joined && !finished && weekNumber === currentWeek && (
    <NextWeekNotice
      week={weekNumber}
      durationWeeks={arc.duration_weeks}
      unlockDate={unlockDate}
      weekDone={weekDone}
    />
  );

  if (week?.is_rest_week) {
    return (
      <div className="space-y-4">
        {nav}
        <div className="rounded-3xl border border-border bg-panel px-6 py-12 text-center">
          <p className="font-heading text-2xl text-ink">🌙 Rest Week</p>
          <p className="mt-2 text-sm text-ink-muted">
            No weekly deliverable this week, just breathe.
          </p>
        </div>
        {notice}
      </div>
    );
  }

  const visibleCount = Math.min(2, deliverables.length);
  const visible = deliverables.slice(0, visibleCount);
  const hidden = deliverables.slice(visibleCount);

  return (
    <div className="space-y-4">
      {finished && <ArcFinishedNotice />}
      {nav}

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

      {notice}

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
