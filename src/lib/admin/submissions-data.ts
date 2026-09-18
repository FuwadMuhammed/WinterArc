import "server-only";
import { cache } from "react";
import { requireAdmin } from "./dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAuthUsers } from "./queries";
import { WINTER_ARC_ID, CATEGORY_LABEL } from "@/lib/constants";
import type { TaskCategory } from "@/lib/database.types";

export const PAGE_SIZE = 25;

export type SubmissionFilters = {
  week: number | null;
  category: TaskCategory | null;
  userArcId: string | null;
  page: number;
};

export type Submission = {
  id: string;
  note: string;
  completed: boolean;
  createdAt: string;
  taskHeading: string;
  week: number;
  day: number | null;
  categoryLabel: string;
  email: string;
  avatarUrl: string | null;
};

export type SubmissionsData = {
  filters: SubmissionFilters;
  submissions: Submission[];
  total: number;
  pageCount: number;
  weeks: number[];
  members: { userArcId: string; email: string }[];
};

const CATEGORIES = Object.keys(CATEGORY_LABEL) as TaskCategory[];

export function parseFilters(params: Record<string, string | undefined>): SubmissionFilters {
  const week = Number(params.week);
  const page = Number(params.page);
  return {
    week: Number.isInteger(week) && week > 0 ? week : null,
    category: CATEGORIES.includes(params.category as TaskCategory)
      ? (params.category as TaskCategory)
      : null,
    userArcId: params.member || null,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Task entries that carry a note or proof link, newest first. */
export const getSubmissionsData = cache(
  async (filters: SubmissionFilters): Promise<SubmissionsData> => {
    await requireAdmin();
    const supabase = createAdminClient();

    const [tasksRes, userArcsRes, weeksRes, authUsers] = await Promise.all([
      supabase.from("tasks").select("*").eq("arc_id", WINTER_ARC_ID),
      supabase.from("user_arcs").select("id, user_id").eq("arc_id", WINTER_ARC_ID),
      supabase.from("weeks").select("week_number").eq("arc_id", WINTER_ARC_ID).order("week_number"),
      fetchAuthUsers(supabase),
    ]);
    const tasks = tasksRes.data ?? [];
    const taskById = new Map(tasks.map((t) => [t.id, t]));
    const userArcs = userArcsRes.data ?? [];
    const userArcById = new Map(userArcs.map((ua) => [ua.id, ua]));

    const members = userArcs
      .map((ua) => ({ userArcId: ua.id, email: authUsers.get(ua.user_id)?.email ?? "(unknown user)" }))
      .sort((a, b) => a.email.localeCompare(b.email));

    // Week/category live on tasks, so filter by the matching task ids.
    const byTask = filters.week !== null || filters.category !== null;
    const matchingTaskIds = tasks
      .filter(
        (t) =>
          (filters.week === null || t.week_number === filters.week) &&
          (filters.category === null || t.category === filters.category),
      )
      .map((t) => t.id);

    let query = supabase
      .from("task_entries")
      .select("*", { count: "exact" })
      .not("note", "is", null)
      .neq("note", "");
    if (byTask) query = query.in("task_id", matchingTaskIds);
    if (filters.userArcId) query = query.eq("user_arc_id", filters.userArcId);

    const from = (filters.page - 1) * PAGE_SIZE;
    const { data, count, error } =
      byTask && matchingTaskIds.length === 0
        ? { data: [], count: 0, error: null }
        : await query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    const submissions: Submission[] = (data ?? []).map((e) => {
      const task = taskById.get(e.task_id);
      const ua = userArcById.get(e.user_arc_id);
      const user = ua ? authUsers.get(ua.user_id) : undefined;
      return {
        id: e.id,
        note: e.note ?? "",
        completed: e.completed,
        createdAt: e.created_at,
        taskHeading: task?.heading ?? "(deleted task)",
        week: task?.week_number ?? 0,
        day: task?.day_number ?? null,
        categoryLabel: task ? (CATEGORY_LABEL[task.category] ?? task.category) : "",
        email: user?.email ?? "(unknown user)",
        avatarUrl: user?.avatarUrl ?? null,
      };
    });

    const total = count ?? 0;
    return {
      filters,
      submissions,
      total,
      pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      weeks: (weeksRes.data ?? []).map((w) => w.week_number),
      members,
    };
  },
);
