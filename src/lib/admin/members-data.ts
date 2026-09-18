import "server-only";
import { cache } from "react";
import { requireAdmin } from "./dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllCompleted, fetchAuthUsers } from "./queries";
import { WINTER_ARC_ID } from "@/lib/constants";
import { getCurrentWeek } from "@/lib/arc-logic";
import type { UserArcStatus } from "@/lib/database.types";

export type Member = {
  userArcId: string;
  userId: string;
  email: string;
  avatarUrl: string | null;
  joinedAt: string;
  status: UserArcStatus;
  lastSignInAt: string | null;
  /** Newest completed entry, the closest thing to "last active" in the data. */
  lastActiveAt: string | null;
  completedCount: number;
  /** 1-indexed week this member is in on their own timeline. */
  currentWeek: number;
  /** Weighted progress against tasks released so far. */
  done: number;
  possible: number;
  pct: number;
};

export type MembersData = {
  durationWeeks: number;
  members: Member[];
};

export const getMembersData = cache(async (): Promise<MembersData> => {
  await requireAdmin();
  const supabase = createAdminClient();

  const [arcRes, tasksRes, userArcsRes, completedRows, authUsers] = await Promise.all([
    supabase.from("arcs").select("*").eq("id", WINTER_ARC_ID).single(),
    supabase.from("tasks").select("id, week_number, weight").eq("arc_id", WINTER_ARC_ID),
    supabase
      .from("user_arcs")
      .select("*")
      .eq("arc_id", WINTER_ARC_ID)
      .order("joined_at", { ascending: false }),
    fetchAllCompleted(supabase),
    fetchAuthUsers(supabase),
  ]);

  if (arcRes.error || !arcRes.data) throw new Error("The Winter Arc isn't seeded yet.");
  const arc = arcRes.data;
  const tasks = tasksRes.data ?? [];
  const taskById = new Map(tasks.map((t) => [t.id, t]));

  // Every member runs their own timeline from joined_at, so "released so far"
  // differs per member: the weight of every task in weeks up to theirs.
  const weightByWeek = new Map<number, number>();
  for (const t of tasks) weightByWeek.set(t.week_number, (weightByWeek.get(t.week_number) ?? 0) + t.weight);
  const releasedWeightThrough = (week: number) =>
    [...weightByWeek].reduce((sum, [w, weight]) => (w <= week ? sum + weight : sum), 0);

  const weekOf = new Map((userArcsRes.data ?? []).map((ua) => [ua.id, getCurrentWeek(arc, ua)]));

  const doneByMember = new Map<string, { weight: number; count: number; last: string | null }>();
  for (const row of completedRows) {
    const agg = doneByMember.get(row.user_arc_id) ?? { weight: 0, count: 0, last: null };
    const task = taskById.get(row.task_id);
    agg.count += 1;
    if (task && task.week_number <= (weekOf.get(row.user_arc_id) ?? 0)) agg.weight += task.weight;
    if (!agg.last || row.created_at > agg.last) agg.last = row.created_at;
    doneByMember.set(row.user_arc_id, agg);
  }

  const members: Member[] = (userArcsRes.data ?? []).map((ua) => {
    const user = authUsers.get(ua.user_id);
    const agg = doneByMember.get(ua.id);
    const done = agg?.weight ?? 0;
    const currentWeek = weekOf.get(ua.id) ?? 1;
    const releasedWeight = releasedWeightThrough(currentWeek);
    return {
      userArcId: ua.id,
      userId: ua.user_id,
      email: user?.email ?? "(unknown user)",
      avatarUrl: user?.avatarUrl ?? null,
      joinedAt: ua.joined_at,
      status: ua.status,
      lastSignInAt: user?.lastSignInAt ?? null,
      lastActiveAt: agg?.last ?? null,
      completedCount: agg?.count ?? 0,
      currentWeek,
      done,
      possible: releasedWeight,
      pct: releasedWeight > 0 ? Math.round((done / releasedWeight) * 100) : 0,
    };
  });

  return { durationWeeks: arc.duration_weeks, members };
});
