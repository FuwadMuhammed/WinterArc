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

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

/** How many of this week's connection-task units are done, against the
 * week's connection goal. */
export function getConnectionProgress(
  weekTasks: Task[],
  entries: TaskEntry[],
  connectionGoal: number | null,
): { done: number; goal: number } {
  const connectionTasks = weekTasks.filter((t) => t.category === "connection");
  const { done } = taskProgress(connectionTasks, entries);
  return { done, goal: connectionGoal ?? 0 };
}

export type HeatmapDay = { date: string; weekday: number; count: number };

/**
 * One entry per calendar day from `startDate` through `endDate` (inclusive),
 * with the real weighted activity completed that day, derived from
 * `task_entries`, never fabricated.
 */
export function computeHeatmap(
  items: { completed_at: string; weight: number }[],
  startDate: Date,
  endDate: Date,
): HeatmapDay[] {
  const byDay = new Map<string, number>();
  for (const item of items) {
    if (item.weight <= 0) continue;
    const key = dateKey(startOfDay(new Date(item.completed_at)));
    byDay.set(key, (byDay.get(key) ?? 0) + item.weight);
  }

  const days: HeatmapDay[] = [];
  const end = startOfDay(endDate);
  for (let d = startOfDay(startDate); d.getTime() <= end.getTime(); d = addDays(d, 1)) {
    days.push({ date: dateKey(d), weekday: d.getDay(), count: byDay.get(dateKey(d)) ?? 0 });
  }
  return days;
}

/** Longest run of consecutive calendar days with at least one completed
 * task, across the given heatmap window. */
export function computeLongestDayStreak(days: HeatmapDay[]): number {
  let longest = 0;
  let current = 0;
  for (const day of days) {
    if (day.count > 0) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}
