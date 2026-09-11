import "server-only";
import { cache } from "react";
import { requireAdmin } from "./dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { WINTER_ARC_ID, CATEGORY_LABEL } from "@/lib/constants";
import { getCurrentWeek, isBufferPeriod } from "@/lib/arc-logic";
import type { Task, UserArcStatus } from "@/lib/database.types";
import { fetchAllCompleted, fetchAuthUsers } from "./queries";

export type WeekProgress = {
  week_number: number;
  is_rest_week: boolean;
  done: number;
  possible: number;
  pct: number;
};

export type RecentSubmission = {
  id: string;
  note: string;
  completed: boolean;
  created_at: string;
  taskHeading: string;
  week: number;
  category: string;
  email: string;
};

export type DashboardData = {
  arcName: string;
  startDate: string;
  durationWeeks: number;
  currentWeek: number;
  isBuffer: boolean;
  members: Record<"total" | UserArcStatus, number>;
  entries: { total: number; completed: number };
  completionRate: number;
  perWeek: WeekProgress[];
  recentSubmissions: RecentSubmission[];
};

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  await requireAdmin();
  const supabase = createAdminClient();

  const [arcRes, weeksRes, tasksRes, userArcsRes, totalRes, completedRes, recentRes, completedRows, authUsers] =
    await Promise.all([
      supabase.from("arcs").select("*").eq("id", WINTER_ARC_ID).single(),
      supabase.from("weeks").select("*").eq("arc_id", WINTER_ARC_ID).order("week_number"),
      supabase.from("tasks").select("*").eq("arc_id", WINTER_ARC_ID),
      supabase.from("user_arcs").select("*").eq("arc_id", WINTER_ARC_ID),
      supabase.from("task_entries").select("id", { count: "exact", head: true }),
      supabase.from("task_entries").select("id", { count: "exact", head: true }).eq("completed", true),
      supabase
        .from("task_entries")
        .select("*")
        .not("note", "is", null)
        .neq("note", "")
        .order("created_at", { ascending: false })
        .limit(20),
      fetchAllCompleted(supabase),
      fetchAuthUsers(supabase),
    ]);

  if (arcRes.error || !arcRes.data) throw new Error("The Winter Arc isn't seeded yet.");
  const arc = arcRes.data;
  const weeks = weeksRes.data ?? [];
  const tasks = tasksRes.data ?? [];
  const userArcs = userArcsRes.data ?? [];

  const userArcById = new Map(userArcs.map((ua) => [ua.id, ua]));
  const taskById = new Map<string, Task>(tasks.map((t) => [t.id, t]));

  const currentWeek = getCurrentWeek(arc);
  const memberCount = userArcs.length;

  // Weight completed per week, across all members.
  const doneByWeek = new Map<number, number>();
  for (const row of completedRows) {
    const task = taskById.get(row.task_id);
    if (!task) continue;
    doneByWeek.set(task.week_number, (doneByWeek.get(task.week_number) ?? 0) + task.weight);
  }
  const weightByWeek = new Map<number, number>();
  for (const t of tasks) {
    weightByWeek.set(t.week_number, (weightByWeek.get(t.week_number) ?? 0) + t.weight);
  }

  const perWeek: WeekProgress[] = weeks.map((w) => {
    const possible = (weightByWeek.get(w.week_number) ?? 0) * memberCount;
    const done = doneByWeek.get(w.week_number) ?? 0;
    return {
      week_number: w.week_number,
      is_rest_week: w.is_rest_week,
      done,
      possible,
      pct: possible > 0 ? Math.round((done / possible) * 100) : 0,
    };
  });

  // Completion rate = completed weight / (members × weight of tasks released so far).
  const releasedWeight = tasks
    .filter((t) => t.week_number <= currentWeek)
    .reduce((sum, t) => sum + t.weight, 0);
  const releasedDone = perWeek
    .filter((w) => w.week_number <= currentWeek)
    .reduce((sum, w) => sum + w.done, 0);
  const possibleReleased = releasedWeight * memberCount;
  const completionRate = possibleReleased > 0 ? Math.round((releasedDone / possibleReleased) * 100) : 0;

  const members: DashboardData["members"] = { total: memberCount, active: 0, completed: 0, abandoned: 0 };
  for (const ua of userArcs) members[ua.status] += 1;

  const recentSubmissions: RecentSubmission[] = (recentRes.data ?? []).map((e) => {
    const task = taskById.get(e.task_id);
    const ua = userArcById.get(e.user_arc_id);
    return {
      id: e.id,
      note: e.note ?? "",
      completed: e.completed,
      created_at: e.created_at,
      taskHeading: task?.heading ?? "(deleted task)",
      week: task?.week_number ?? 0,
      category: task ? (CATEGORY_LABEL[task.category] ?? task.category) : "",
      email: ua ? (authUsers.get(ua.user_id)?.email ?? "(unknown user)") : "(unknown user)",
    };
  });

  return {
    arcName: arc.name,
    startDate: arc.start_date,
    durationWeeks: arc.duration_weeks,
    currentWeek,
    isBuffer: isBufferPeriod(arc),
    members,
    entries: { total: totalRes.count ?? 0, completed: completedRes.count ?? 0 },
    completionRate,
    perWeek,
    recentSubmissions,
  };
});
