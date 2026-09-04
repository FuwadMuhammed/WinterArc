import {
  computeHeatmap,
  computeLongestDayStreak,
  entryFor,
  getCurrentDay,
  getCurrentWeek,
  getHeatmapRange,
  taskProgress,
} from "@/lib/arc-logic";
import { HeatmapGrid } from "@/components/HeatmapGrid";
import { CategoryProgressRow } from "@/components/CategoryProgressRow";
import { TaskCard } from "@/components/home/TaskCard";
import { BlurredTeaser } from "@/components/home/BlurredTeaser";
import { CATEGORY_LABEL, REAL_CATEGORIES } from "@/lib/constants";
import type { Arc, Task, TaskEntry, Week } from "@/lib/database.types";

export function OverviewTab({
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
  const { start: heatmapStart, end: heatmapEnd } = getHeatmapRange(arc);
  const completedItems = entries
    .filter((e) => e.completed)
    .map((e) => ({
      created_at: e.created_at,
      weight: tasks.find((t) => t.id === e.task_id)?.weight ?? 1,
    }));
  const days = computeHeatmap(completedItems, heatmapStart, heatmapEnd);
  const totalReps = completedItems.reduce((sum, i) => sum + i.weight, 0);
  const longestStreak = computeLongestDayStreak(days);

  const { done: doneWeight, total: totalWeight } = taskProgress(tasks, entries);
  const overallPct = totalWeight ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const startLabel = heatmapStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const weekNumber = getCurrentWeek(arc);
  const week = weeks.find((w) => w.week_number === weekNumber);
  const currentDay = getCurrentDay(arc);
  const weekTasks = tasks.filter((t) => t.week_number === weekNumber);
  const todaysTasks = weekTasks.filter((t) => t.day_number === currentDay);
  const weekDeliverables = weekTasks.filter((t) => t.day_number === null);

  const categoryRows = REAL_CATEGORIES.map((category) => ({
    category,
    progress: taskProgress(
      tasks.filter((t) => t.category === category),
      entries,
    ),
  }));

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-panel px-6 py-6">
        <p className="text-sm font-semibold text-ink">Total repetitions</p>
        <p className="text-xs text-ink-muted">Since {startLabel}</p>
        <p className="mt-2 font-heading text-5xl text-ink">{totalReps}</p>
        <div className="mt-5">
          <HeatmapGrid days={days} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl border border-border bg-panel px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Completion rate
          </p>
          <p className="mt-2 font-heading text-4xl text-ink">{overallPct}%</p>
        </div>
        <div className="rounded-3xl border border-border bg-panel px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Longest streak
          </p>
          <p className="mt-2 font-heading text-4xl text-ink">
            {longestStreak}
            <span className="text-lg text-ink-faint"> days</span>
          </p>
        </div>
      </div>

      {week?.is_rest_week ? (
        <div className="rounded-3xl border border-border bg-panel px-6 py-8 text-center">
          <p className="font-heading text-xl text-ink">🌙 Rest Week</p>
          <p className="mt-1 text-sm text-ink-muted">No tasks this week, just breathe.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-border bg-panel">
            <div className="px-6 py-4">
              <p className="text-sm font-semibold text-ink">
                Today - Week {weekNumber}, Day {currentDay}
              </p>
            </div>
            {todaysTasks.length === 0 ? (
              <p className="px-6 pb-5 text-sm text-ink-muted">
                {currentDay === 7 ? "Day 7 is always rest. No tasks today." : "Nothing scheduled today."}
              </p>
            ) : (
              <div className="space-y-2 px-4 pb-4">
                {joined ? (
                  todaysTasks.map((t, i) => (
                    <TaskCard key={t.id} task={t} entry={entryFor(entries, t.id)} index={i} readOnly={!joined} />
                  ))
                ) : (
                  <BlurredTeaser message="Join to see today's tasks" onJoinClick={onOpenAuth}>
                    <div className="space-y-2">
                      {todaysTasks.map((t, i) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          entry={entryFor(entries, t.id)}
                          index={i}
                          readOnly={!joined}
                        />
                      ))}
                    </div>
                  </BlurredTeaser>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-panel">
            <div className="px-6 py-4">
              <p className="text-sm font-semibold text-ink">This week&apos;s deliverables</p>
            </div>
            {weekDeliverables.length === 0 ? (
              <p className="px-6 pb-5 text-sm text-ink-muted">Nothing due this week.</p>
            ) : (
              <div className="space-y-2 px-4 pb-4">
                {joined ? (
                  weekDeliverables.map((t, i) => (
                    <TaskCard key={t.id} task={t} entry={entryFor(entries, t.id)} index={i} readOnly={!joined} />
                  ))
                ) : (
                  <BlurredTeaser message="Join to see this week's deliverables" onJoinClick={onOpenAuth}>
                    <div className="space-y-2">
                      {weekDeliverables.map((t, i) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          entry={entryFor(entries, t.id)}
                          index={i}
                          readOnly={!joined}
                        />
                      ))}
                    </div>
                  </BlurredTeaser>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <div className="overflow-hidden rounded-3xl border border-border bg-panel">
        <div className="px-6 py-4">
          <p className="text-sm font-semibold text-ink">By category</p>
        </div>
        {categoryRows.map(({ category, progress }) => (
          <CategoryProgressRow
            key={category}
            category={CATEGORY_LABEL[category]}
            done={progress.done}
            total={progress.total}
          />
        ))}
      </div>
    </div>
  );
}
