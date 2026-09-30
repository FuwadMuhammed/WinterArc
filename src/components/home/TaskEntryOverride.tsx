"use client";

import { createContext, useContext, type ReactNode } from "react";

type ApplyLocalEntry = (taskId: string, patch: { completed: boolean; note: string }) => void;

const TaskEntryOverrideContext = createContext<ApplyLocalEntry | null>(null);

export function TaskEntryOverrideProvider({
  apply,
  children,
}: {
  apply: ApplyLocalEntry;
  children: ReactNode;
}) {
  return <TaskEntryOverrideContext.Provider value={apply}>{children}</TaskEntryOverrideContext.Provider>;
}

/**
 * TaskCard already flips its own checkbox instantly and debounces the actual
 * write to Supabase (see TaskCard's `toggle`). But everything *else* that
 * reads completion — the heatmap, progress bars, quick facts, streaks — was
 * only fed by the `entries` prop from the server, which doesn't move until
 * the debounced write finishes and `router.refresh()` brings fresh data
 * down. That's the lag between ticking a task and seeing it land elsewhere.
 *
 * This lets a TaskCard patch the shared, optimistic `entries` state the
 * moment it flips locally, so every aggregate updates in the same frame.
 * The debounced write and eventual refresh are unchanged; this just stops
 * everything downstream from waiting on them too.
 */
export function useTaskEntryOverride(): ApplyLocalEntry {
  const apply = useContext(TaskEntryOverrideContext);
  if (!apply) {
    throw new Error("useTaskEntryOverride must be used within a TaskEntryOverrideProvider");
  }
  return apply;
}
