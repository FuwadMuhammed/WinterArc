import {
  computeDayProgress,
  computeLongestPlanStreak,
  computePlanGrid,
  countDaysBehind,
  entryFor,
  findResumePoint,
  getArcStartDate,
  getCurrentDay,
  getCurrentWeek,
  isArcFinished,
  planDayIndex,
  taskProgress,
  type PlanDay,
} from "@/lib/arc-logic";
import { HeatmapGrid } from "@/components/HeatmapGrid";
import { CategoryProgressRow } from "@/components/CategoryProgressRow";
import { TaskCard } from "@/components/home/TaskCard";
import { BlurredTeaser } from "@/components/home/BlurredTeaser";
import { ResumeNotice } from "@/components/home/ResumeNotice";
import { CATEGORY_LABEL, REAL_CATEGORIES } from "@/lib/constants";
import type { Arc, Task, TaskEntry, UserArc, Week } from "@/lib/database.types";

export function OverviewTab({
  arc,
  weeks,
  tasks,
  entries,
  userArc,
  onOpenAuth,
  onGoToPlanDay,
}: {
  arc: Arc;
  weeks: Week[];
  tasks: Task[];
  entries: TaskEntry[];
  userArc: UserArc | null;
  onOpenAuth: () => void;
  onGoToPlanDay: (target: PlanDay) => void;
}) {
  const joined = userArc !== null;
  const finished = joined && isArcFinished(arc, userArc);
  const grid = computePlanGrid(tasks, entries, arc.duration_weeks);
  const longestStreak = computeLongestPlanStreak(grid);
  const { totalDays, completedDays } = computeDayProgress(grid);

  const { done: doneWeight, total: totalWeight } = taskProgress(tasks, entries);
  const overallPct = totalWeight ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const startLabel = getArcStartDate(userArc).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const weekNumber = getCurrentWeek(arc, userArc);
  const week = weeks.find((w) => w.week_number === weekNumber);
  const currentDay = getCurrentDay(userArc);
  const weekTasks = tasks.filter((t) => t.week_number === weekNumber);
  const todaysTasks = weekTasks.filter((t) => t.day_number === currentDay);
  const weekDeliverables = weekTasks.filter((t) => t.day_number === null);

  // Where the member actually is in the plan, as opposed to the calendar.
  const today: PlanDay = { week: weekNumber, day: currentDay };
  const resume = joined && !finished ? findResumePoint(grid, today) : null;
  const resumeNotice = resume !== null && planDayIndex(resume) < planDayIndex(today) && (
    <ResumeNotice
      compact
      resume={resume}
      today={today}
      daysBehind={countDaysBehind(grid, today)}
      onJump={() => onGoToPlanDay(resume)}
    />
  );

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
        <p className="text-xs text-ink-muted">
          {joined ? `Since ${startLabel}` : `${arc.duration_weeks} weeks, from the day you join`}
        </p>
        <p className="mt-2 font-heading text-5xl text-ink">{doneWeight}</p>
        <div className="mt-5">
          <HeatmapGrid totalDays={totalDays} completedDays={completedDays} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-border bg-panel px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Completion rate
          </p>
          <p className="mt-2 font-heading text-4xl text-ink">{overallPct}%</p>
        </div>
        <div className="rounded-3xl border border-border bg-panel px-4 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Longest streak
          </p>
          <p className="mt-2 font-heading text-4xl text-ink">
            {longestStreak}
            <span className="text-lg text-ink-faint"> days</span>
          </p>
        </div>
      </div>

      {finished ? (
        <div className="rounded-3xl border border-border bg-panel px-6 py-8 text-center">
          <p className="font-heading text-xl text-ink">🏁 Arc complete</p>
          <p className="mt-1 text-sm text-ink-muted">
            {arc.duration_weeks} weeks, done. Reset progress from your profile to run it again.
          </p>
        </div>
      ) : week?.is_rest_week ? (
        <>
          {resumeNotice}
          <div className="rounded-3xl border border-border bg-panel px-6 py-8 text-center">
            <p className="font-heading text-xl text-ink">🌙 Rest Week</p>
            <p className="mt-1 text-sm text-ink-muted">No tasks this week, just breathe.</p>
          </div>
        </>
      ) : (
        <>
          {resumeNotice}
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
