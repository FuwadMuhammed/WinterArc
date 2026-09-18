import "server-only";
import { cache } from "react";
import { requireAdmin } from "./dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { WINTER_ARC_ID } from "@/lib/constants";
import { getCurrentWeek } from "@/lib/arc-logic";
import type { Arc, Task, Week } from "@/lib/database.types";

export type TaskWithStats = Task & {
  /** Members who have an entry (completed or not) for this task. */
  entryCount: number;
};

export type TasksData = {
  arc: Arc;
  weeks: Week[];
  currentWeek: number;
  selectedWeek: Week;
  tasks: TaskWithStats[];
  taskCountByWeek: Record<number, number>;
};

export const getTasksData = cache(async (requestedWeek: number | null): Promise<TasksData> => {
  await requireAdmin();
  const supabase = createAdminClient();

  const [arcRes, weeksRes, countsRes] = await Promise.all([
    supabase.from("arcs").select("*").eq("id", WINTER_ARC_ID).single(),
    supabase.from("weeks").select("*").eq("arc_id", WINTER_ARC_ID).order("week_number"),
    supabase.from("tasks").select("week_number").eq("arc_id", WINTER_ARC_ID),
  ]);
  if (arcRes.error || !arcRes.data) throw new Error("The Winter Arc isn't seeded yet.");
  const arc = arcRes.data;
  const weeks = weeksRes.data ?? [];
  if (weeks.length === 0) throw new Error("No weeks are seeded for this arc.");

  const currentWeek = getCurrentWeek(arc);
  const selectedWeek =
    weeks.find((w) => w.week_number === requestedWeek) ??
    weeks.find((w) => w.week_number === currentWeek) ??
    weeks[0];

  const taskCountByWeek: Record<number, number> = {};
  for (const row of countsRes.data ?? []) {
    taskCountByWeek[row.week_number] = (taskCountByWeek[row.week_number] ?? 0) + 1;
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("arc_id", WINTER_ARC_ID)
    .eq("week_number", selectedWeek.week_number)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;

  const ids = (tasks ?? []).map((t) => t.id);
  const entryCount = new Map<string, number>();
  if (ids.length > 0) {
    const { data: entries } = await supabase.from("task_entries").select("task_id").in("task_id", ids);
    for (const e of entries ?? []) entryCount.set(e.task_id, (entryCount.get(e.task_id) ?? 0) + 1);
  }

  return {
    arc,
    weeks,
    currentWeek,
    selectedWeek,
    tasks: (tasks ?? []).map((t) => ({ ...t, entryCount: entryCount.get(t.id) ?? 0 })),
    taskCountByWeek,
  };
});
