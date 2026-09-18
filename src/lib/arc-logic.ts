import type { Arc, Task, TaskEntry, UserArc } from "@/lib/database.types";

type Duration = Pick<Arc, "duration_weeks">;
/** null for guests, who preview the arc as if they'd started today. */
type Membership = Pick<UserArc, "joined_at"> | null;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Whole calendar days from `a` to `b`, immune to DST shifting a day by an hour. */
function daysBetween(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
}

// --- Timeline ----------------------------------------------------------------
// Every member runs their own arc: Day 1 is the local calendar day they
// joined, and the arc lasts exactly duration_weeks * 7 days from there.

export function getArcStartDate(userArc: Membership, now = new Date()): Date {
  return startOfDay(userArc ? new Date(userArc.joined_at) : now);
}

export function getArcEndDate(arc: Duration, userArc: Membership, now = new Date()): Date {
  return addDays(getArcStartDate(userArc, now), arc.duration_weeks * 7 - 1);
}

/** Clamped at 0 so clock skew between the server that stamped joined_at and
 * the viewer's device can't put a brand-new member before their own Day 1. */
function daysIntoArc(userArc: Membership, now: Date): number {
  return Math.max(0, daysBetween(getArcStartDate(userArc, now), startOfDay(now)));
}

/** 1-indexed current week, clamped to the last week once the arc is over. */
export function getCurrentWeek(arc: Duration, userArc: Membership, now = new Date()): number {
  const week = Math.floor(daysIntoArc(userArc, now) / 7) + 1;
  return Math.min(week, arc.duration_weeks);
}

/** 1-indexed day within the current week (1-7). */
export function getCurrentDay(userArc: Membership, now = new Date()): number {
  return (daysIntoArc(userArc, now) % 7) + 1;
}

export function isArcFinished(arc: Duration, userArc: Membership, now = new Date()): boolean {
  return daysIntoArc(userArc, now) >= arc.duration_weeks * 7;
}

export function getWeekDateRange(
  userArc: Membership,
  weekNumber: number,
  now = new Date(),
): { start: Date; end: Date } {
  const start = addDays(getArcStartDate(userArc, now), (weekNumber - 1) * 7);
  return { start, end: addDays(start, 6) };
}

// --- Task progress -----------------------------------------------------------

export function entryFor(entries: TaskEntry[], taskId: string): TaskEntry | undefined {
  return entries.find((e) => e.task_id === taskId);
}

export type TaskProgress = { done: number; total: number };

/** Weighted done/total across a set of tasks (weight lets one task count for
 * more than one unit, e.g. Week 12's "Reconnect, Twice"). */
export function taskProgress(tasks: Task[], entries: TaskEntry[]): TaskProgress {
  const total = tasks.reduce((sum, t) => sum + t.weight, 0);
  const done = tasks.reduce((sum, t) => {
    const entry = entryFor(entries, t.id);
    return sum + (entry?.completed ? t.weight : 0);
  }, 0);
  return { done, total };
}

// --- Plan grid ---------------------------------------------------------------
// Progress is tracked against the plan (Week N, Day M), not the calendar day a
// box was ticked, so catching up on a missed day fills that day's cell.

export type PlanCell = { week: number; day: number; done: number; total: number };
export type PlanRow = { week: number; cells: PlanCell[] };

const DAYS_PER_WEEK = 7;

/** One row per week, one cell per plan day, with weighted done/total for that
 * day's tasks. Deliverables (no day) are left out. `total` 0 means no tasks. */
export function computePlanGrid(tasks: Task[], entries: TaskEntry[], durationWeeks: number): PlanRow[] {
  const byDay = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.day_number === null) continue;
    const key = `${task.week_number}:${task.day_number}`;
    byDay.set(key, [...(byDay.get(key) ?? []), task]);
  }

  const rows: PlanRow[] = [];
  for (let week = 1; week <= durationWeeks; week++) {
    const cells: PlanCell[] = [];
    for (let day = 1; day <= DAYS_PER_WEEK; day++) {
      const { done, total } = taskProgress(byDay.get(`${week}:${day}`) ?? [], entries);
      cells.push({ week, day, done, total });
    }
    rows.push({ week, cells });
  }
  return rows;
}

/** Days of work completed, as a fraction-aware count: each plan day with
 * tasks contributes done/total, so two half-done days add up to one full
 * square. `totalDays` counts only days that have tasks. */
export function computeDayProgress(grid: PlanRow[]): { totalDays: number; completedDays: number } {
  let totalDays = 0;
  let completedDays = 0;
  for (const row of grid) {
    for (const cell of row.cells) {
      if (cell.total === 0) continue;
      totalDays++;
      completedDays += cell.done / cell.total;
    }
  }
  return { totalDays, completedDays };
}

/** Longest run of consecutive plan days with at least one task done. Days
 * with no tasks (rest days, the rest week) neither extend nor break a run. */
export function computeLongestPlanStreak(grid: PlanRow[]): number {
  let longest = 0;
  let current = 0;
  for (const row of grid) {
    for (const cell of row.cells) {
      if (cell.total === 0) continue;
      if (cell.done > 0) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
  }
  return longest;
}

// --- Resume point ------------------------------------------------------------
// "Today" is calendar-driven, but where someone actually is in the plan is the
// first day they haven't finished. Showing both keeps the calendar honest
// while pointing a returning member at the right place to pick up.

export type PlanDay = { week: number; day: number };

/** Position in the arc, for ordering plan days. */
export function planDayIndex(d: PlanDay): number {
  return (d.week - 1) * DAYS_PER_WEEK + d.day;
}

function unfinishedDaysUpTo(grid: PlanRow[], today: PlanDay): PlanCell[] {
  const limit = planDayIndex(today);
  const cells: PlanCell[] = [];
  for (const row of grid) {
    for (const cell of row.cells) {
      if (planDayIndex(cell) > limit) return cells;
      if (cell.total > 0 && cell.done < cell.total) cells.push(cell);
    }
  }
  return cells;
}

/** First plan day, no later than `today`, with tasks not all done. null when
 * everything up to today is finished. */
export function findResumePoint(grid: PlanRow[], today: PlanDay): PlanDay | null {
  const [first] = unfinishedDaysUpTo(grid, today);
  return first ? { week: first.week, day: first.day } : null;
}

/** Unfinished plan days strictly before `today`, i.e. how far behind the
 * calendar someone is. */
export function countDaysBehind(grid: PlanRow[], today: PlanDay): number {
  const todayIndex = planDayIndex(today);
  return unfinishedDaysUpTo(grid, today).filter((c) => planDayIndex(c) < todayIndex).length;
}
