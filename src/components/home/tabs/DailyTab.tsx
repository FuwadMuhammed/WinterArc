import { entryFor, getCurrentDay, getCurrentWeek } from "@/lib/arc-logic";
import { TaskCard } from "@/components/home/TaskCard";
import { BlurredTeaser } from "@/components/home/BlurredTeaser";
import type { Arc, Task, TaskEntry, Week } from "@/lib/database.types";

export function DailyTab({
  arc,
  weeks,
  tasks,
  entries,
  joined,
  onOpenAuth,
}: {
  arc: Arc;
  weeks: Week[];
  tasks: Task[];
  entries: TaskEntry[];
  joined: boolean;
  onOpenAuth: () => void;
}) {
  const weekNumber = getCurrentWeek(arc);
  const week = weeks.find((w) => w.week_number === weekNumber);
  const currentDay = getCurrentDay(arc);

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
          {day === currentDay && (
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
              readOnly={!joined}
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
    </div>
  );
}
