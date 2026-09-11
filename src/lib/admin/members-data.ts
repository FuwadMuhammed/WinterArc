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
  /** Weighted progress against tasks released so far. */
  done: number;
  possible: number;
  pct: number;
};

export type MembersData = {
  currentWeek: number;
  releasedWeight: number;
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
  const currentWeek = getCurrentWeek(arcRes.data);
  const tasks = tasksRes.data ?? [];

  const releasedTasks = new Map(
    tasks.filter((t) => t.week_number <= currentWeek).map((t) => [t.id, t.weight]),
  );
  const releasedWeight = [...releasedTasks.values()].reduce((a, b) => a + b, 0);

  const doneByMember = new Map<string, { weight: number; count: number; last: string | null }>();
  for (const row of completedRows) {
    const agg = doneByMember.get(row.user_arc_id) ?? { weight: 0, count: 0, last: null };
    agg.count += 1;
    agg.weight += releasedTasks.get(row.task_id) ?? 0;
    if (!agg.last || row.created_at > agg.last) agg.last = row.created_at;
    doneByMember.set(row.user_arc_id, agg);
  }

  const members: Member[] = (userArcsRes.data ?? []).map((ua) => {
    const user = authUsers.get(ua.user_id);
    const agg = doneByMember.get(ua.id);
    const done = agg?.weight ?? 0;
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
      done,
      possible: releasedWeight,
      pct: releasedWeight > 0 ? Math.round((done / releasedWeight) * 100) : 0,
    };
  });

  return { currentWeek, releasedWeight, members };
});
