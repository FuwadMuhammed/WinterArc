import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { WINTER_ARC_ID } from "@/lib/constants";
import type { Arc, Task, TaskEntry, UserArc, Week } from "@/lib/database.types";

/** Tag admin writes invalidate (see `planChanged()` in lib/admin/task-actions.ts). */
export const PLAN_CACHE_TAG = "arc-plan";

/**
 * The arc's plan (arc/weeks/tasks) is identical for every visitor and rarely
 * changes, but was being re-fetched from Supabase on every single page nav —
 * the main source of the delay between pages. Cache it across requests;
 * admin edits bust it immediately via `revalidateTag(PLAN_CACHE_TAG)`, and it
 * also self-heals after 5 minutes if a tag invalidation is ever missed.
 */
const getPlan = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const [{ data: arc }, { data: weeks }, { data: tasks }] = await Promise.all([
      supabase.from("arcs").select("*").eq("id", WINTER_ARC_ID).single(),
      supabase.from("weeks").select("*").eq("arc_id", WINTER_ARC_ID).order("week_number"),
      supabase
        .from("tasks")
        .select("*")
        .eq("arc_id", WINTER_ARC_ID)
        .order("week_number")
        .order("sort_order"),
    ]);

    if (!arc || !weeks || !tasks) {
      throw new Error("The Winter Arc isn't seeded yet.");
    }

    return { arc, weeks: weeks as Week[], tasks: tasks as Task[] };
  },
  ["arc-plan", WINTER_ARC_ID],
  { tags: [PLAN_CACHE_TAG], revalidate: 300 },
);

export type HomeData = {
  userId: string | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
  arc: Arc;
  weeks: Week[];
  tasks: Task[];
  userArc: UserArc | null;
  entries: TaskEntry[];
};

/**
 * Everything the single-page app needs, for guests and members alike.
 * Wrapped in React's `cache()` so multiple components can call it within one
 * request without duplicating the Supabase round trips.
 */
export const getHomeData = cache(async (): Promise<HomeData> => {
  const supabase = await createClient();

  // Run the auth check (a real round trip to Supabase's auth server) and the
  // cached plan fetch concurrently instead of one after the other.
  const [
    {
      data: { user },
    },
    { arc, weeks, tasks },
  ] = await Promise.all([supabase.auth.getUser(), getPlan()]);

  let userArc: UserArc | null = null;
  let entries: TaskEntry[] = [];

  if (user) {
    // Embed task_entries in the same request instead of a second round trip.
    const { data } = await supabase
      .from("user_arcs")
      .select("*, task_entries(*)")
      .eq("user_id", user.id)
      .eq("arc_id", WINTER_ARC_ID)
      .maybeSingle();

    if (data) {
      const row = data as UserArc & { task_entries: TaskEntry[] | null };
      const { task_entries, ...rest } = row;
      userArc = rest;
      entries = task_entries ?? [];
    }
  }

  return {
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    userAvatarUrl: (user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null) as
      | string
      | null,
    arc,
    weeks: weeks as Week[],
    tasks: tasks as Task[],
    userArc,
    entries,
  };
});
