import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { WINTER_ARC_ID } from "@/lib/constants";
import type { Arc, Task, TaskEntry, UserArc, Week } from "@/lib/database.types";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  let userArc: UserArc | null = null;
  let entries: TaskEntry[] = [];

  if (user) {
    const { data } = await supabase
      .from("user_arcs")
      .select("*")
      .eq("user_id", user.id)
      .eq("arc_id", WINTER_ARC_ID)
      .maybeSingle();
    userArc = data;

    if (userArc) {
      const { data: entryRows } = await supabase
        .from("task_entries")
        .select("*")
        .eq("user_arc_id", userArc.id);
      entries = (entryRows ?? []) as TaskEntry[];
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
