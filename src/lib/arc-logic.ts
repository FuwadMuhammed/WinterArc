import type { Arc, Task, TaskEntry } from "@/lib/database.types";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parses a date-only string ("2026-09-01") as a local calendar date, avoiding
 * the UTC-midnight round-trip that shifts it a day in non-UTC timezones. */
function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 1-indexed current week of the plan, clamped to [1, duration_weeks]. Once
 * the plan's numbered weeks are over (the buffer period), this stays at the
 * last week, check `isBufferPeriod` to detect that. */
export function getCurrentWeek(arc: Pick<Arc, "start_date" | "duration_weeks">, now = new Date()): number {
  const start = parseDateOnly(arc.start_date);
  const today = startOfDay(now);
  const daysSince = Math.floor((today.getTime() - start.getTime()) / DAY_MS);
  const week = Math.floor(daysSince / 7) + 1;
  return Math.min(Math.max(week, 1), arc.duration_weeks);
}

/** 1-indexed current day-of-week within the plan (1-7), clamped to 1 before
 * the plan starts. */
export function getCurrentDay(arc: Pick<Arc, "start_date">, now = new Date()): number {
  const start = parseDateOnly(arc.start_date);
  const today = startOfDay(now);
  if (today.getTime() < start.getTime()) return 1;
  const daysSince = Math.floor((today.getTime() - start.getTime()) / DAY_MS);
  return (daysSince % 7) + 1;
}

export function getWeekDateRange(
  arc: Pick<Arc, "start_date">,
  weekNumber: number,
): { start: Date; end: Date } {
  const start = parseDateOnly(arc.start_date);
  const weekStart = new Date(start.getTime() + (weekNumber - 1) * 7 * DAY_MS);
  const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
  return { start: weekStart, end: weekEnd };
}

/** The arc's displayed end date: December 31 of its start year. */
export function getArcEndDate(arc: Pick<Arc, "start_date" | "duration_weeks">): Date {
  const start = parseDateOnly(arc.start_date);
  return new Date(start.getFullYear(), 11, 31);
}

/** True once the plan's numbered weeks are done but the arc hasn't reached
 * its Dec 31 end yet, the buffer period (e.g. Dec 24 - Dec 31). */
export function isBufferPeriod(
  arc: Pick<Arc, "start_date" | "duration_weeks">,
  now = new Date(),
): boolean {
  const start = parseDateOnly(arc.start_date);
  const planEnd = new Date(start.getTime() + arc.duration_weeks * 7 * DAY_MS - DAY_MS);
  const today = startOfDay(now);
  return today.getTime() > planEnd.getTime() && today.getTime() <= getArcEndDate(arc).getTime();
}

export function isArcFinished(arc: Pick<Arc, "start_date" | "duration_weeks">, now = new Date()): boolean {
  return startOfDay(now).getTime() > getArcEndDate(arc).getTime();
}

/** Displayed heatmap window: every day from October 1 through the arc's end
 * date (clipped only if the arc itself starts after October 1). */
export function getHeatmapRange(
  arc: Pick<Arc, "start_date" | "duration_weeks">,
): { start: Date; end: Date } {
  const arcStart = parseDateOnly(arc.start_date);
  const oct1 = new Date(arcStart.getFullYear(), 9, 1);
  return {
    start: arcStart.getTime() > oct1.getTime() ? arcStart : oct1,
    end: getArcEndDate(arc),
  };
}

export function daysUntil(dateStr: string, now = new Date()): number {
  const target = parseDateOnly(dateStr);
  const today = startOfDay(now);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

export function formatDateRange(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
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
  items: { created_at: string; weight: number }[],
  startDate: Date,
  endDate: Date,
): HeatmapDay[] {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  const byDay = new Map<string, number>();
  for (const item of items) {
    if (item.weight <= 0) continue;
    const key = dateKey(startOfDay(new Date(item.created_at)));
    byDay.set(key, (byDay.get(key) ?? 0) + item.weight);
  }

  const days: HeatmapDay[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    const d = new Date(t);
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
