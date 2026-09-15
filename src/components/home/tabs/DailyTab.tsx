"use client";

import { useEffect, useRef, useState } from "react";
import { entryFor, getCurrentDay, getCurrentWeek, isArcFinished } from "@/lib/arc-logic";
import { TaskCard } from "@/components/home/TaskCard";
import { BlurredTeaser } from "@/components/home/BlurredTeaser";
import { ShareModal } from "@/components/home/ShareModal";
import { ArcFinishedNotice } from "@/components/home/ArcFinishedNotice";
import { arcCompleteShareText, dailyShareText, weekStreakShareText } from "@/lib/constants";
import type { Arc, Task, TaskEntry, UserArc, Week } from "@/lib/database.types";

type ShareMoment = { heading: string; message: string; shareText: string } | null;

function getShareMoment(arc: Arc, weekNumber: number, currentDay: number): ShareMoment {
  const isFinalWeek = weekNumber === arc.duration_weeks;
  if (weekNumber === 1 && currentDay === 1) {
    return {
      heading: "Day 1 complete!",
      message: "You just made your first move. Share it, public commitment is what makes it stick.",
      shareText: dailyShareText(arc.name, 1),
    };
  }
  if (currentDay === 6 && isFinalWeek) {
    return {
      heading: "You finished the Winter Arc!",
      message: `${arc.duration_weeks} weeks, done. Share the journey, it might be the nudge someone else needs to start theirs.`,
      shareText: arcCompleteShareText(arc.name, arc.duration_weeks),
    };
  }
  if (currentDay === 6) {
    return {
      heading: `Week ${weekNumber} complete!`,
      message: "Another week in the books. Share your progress and inspire someone else to start.",
      shareText: weekStreakShareText(arc.name, weekNumber),
    };
  }
  return null;
}

export function DailyTab({
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
  const currentDay = getCurrentDay(userArc);

  const todaysTasks = tasks.filter((t) => t.week_number === weekNumber && t.day_number === currentDay);
  const allTodayDone =
    joined && !finished && todaysTasks.length > 0 && todaysTasks.every((t) => entryFor(entries, t.id)?.completed);
  // Prompting to share every single day would train people to reflexively
  // dismiss it, so it only fires on moments actually worth telling someone
  // about: day one (fresh public commitment), the last active day of each
  // week (a natural "finished the week" beat), and the final week.
  const shareMoment = getShareMoment(arc, weekNumber, currentDay);
  const [shareOpen, setShareOpen] = useState(false);
  const prevAllDoneRef = useRef(allTodayDone);

  useEffect(() => {
    if (allTodayDone && shareMoment && !prevAllDoneRef.current) setShareOpen(true);
    prevAllDoneRef.current = allTodayDone;
  }, [allTodayDone, shareMoment]);

  if (week?.is_rest_week) {
    return (
      <div className="rounded-3xl border border-border bg-panel px-6 py-12 text-center">
        <p className="font-heading text-2xl text-ink">🌙 Rest Week</p>
        <p className="mt-2 text-sm text-ink-muted">
          No daily tasks this week. Optional: look back at what you made in weeks 1–6.
        </p>
      </div>
    );
  }

  const weekTasks = tasks.filter((t) => t.week_number === weekNumber);
  let running = 0;
  const dayGroups = [1, 2, 3, 4, 5, 6]
    .map((day) => {
      const dayTasks = weekTasks.filter((t) => t.day_number === day);
      const startIndex = running;
      running += dayTasks.length;
      return { day, dayTasks, startIndex };
    })
    .filter((g) => g.dayTasks.length > 0);

  function renderDay({ day, dayTasks, startIndex }: { day: number; dayTasks: Task[]; startIndex: number }) {
    return (
      <div key={day} className="overflow-hidden rounded-3xl border border-border bg-panel">
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold text-ink">Day {day}</p>
          {day === currentDay && !finished && (
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
              Today
            </span>
          )}
        </div>
        <div className="space-y-2 px-4 pb-4">
          {dayTasks.map((t, i) => (
            <TaskCard
              key={t.id}
              task={t}
              entry={entryFor(entries, t.id)}
              index={startIndex + i}
              readOnly={locked}
            />
          ))}
        </div>
      </div>
    );
  }

  const [first, ...rest] = dayGroups;
  // Guests only get a couple more days blurred as a teaser, not the whole
  // rest of the week, so the locked state doesn't stretch on forever.
  const guestPreview = rest.slice(0, 2);

  return (
    <div className="space-y-4">
      {finished && <ArcFinishedNotice />}
      {first && renderDay(first)}
      {rest.length > 0 &&
        (joined ? (
          rest.map(renderDay)
        ) : (
          <BlurredTeaser message="Join to see the rest of the week" onJoinClick={onOpenAuth}>
            <div className="space-y-4">{guestPreview.map(renderDay)}</div>
          </BlurredTeaser>
        ))}
      <div className="rounded-3xl border border-border bg-panel px-6 py-5 text-center text-sm text-ink-faint">
        Day 7 - Rest. No tasks today.
      </div>

      {shareMoment && (
        <ShareModal
          key={shareMoment.heading}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          heading={shareMoment.heading}
          message={shareMoment.message}
          shareText={shareMoment.shareText}
        />
      )}
    </div>
  );
}
