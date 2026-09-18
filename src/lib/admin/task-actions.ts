"use server";

import { revalidatePath } from "next/cache";
import type { AuthResult } from "@/lib/actions";
import type { TaskCategory } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { WINTER_ARC_ID } from "@/lib/constants";
import { requireAdmin } from "./dal";

const CATEGORIES: TaskCategory[] = [
  "ui_practice",
  "connection",
  "learn_explain",
  "rotating_lens",
  "build_public",
  "reflection",
];

export type TaskInput = {
  heading: string;
  subcontent: string;
  category: TaskCategory;
  /** 1-7 for a daily task, null for the weekly deliverable. */
  day_number: number | null;
  requires_proof: boolean;
  weight: number;
};

function planChanged() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/members");
}

function validateTask(input: TaskInput): { value: TaskInput } | { error: string } {
  const heading = input.heading.trim();
  const subcontent = input.subcontent.trim();
  if (!heading) return { error: "Heading is required." };
  if (!subcontent) return { error: "Description is required." };
  if (!CATEGORIES.includes(input.category)) return { error: "Unknown category." };
  const day = input.day_number;
  if (day !== null && (!Number.isInteger(day) || day < 1 || day > 7)) {
    return { error: "Day must be 1–7 or the weekly deliverable." };
  }
  if (!Number.isInteger(input.weight) || input.weight < 1 || input.weight > 20) {
    return { error: "Weight must be a whole number from 1 to 20." };
  }
  return {
    value: { ...input, heading, subcontent, requires_proof: Boolean(input.requires_proof) },
  };
}

// --- Arc -----------------------------------------------------------------

export async function updateArcAction(formData: FormData): Promise<AuthResult> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const start_date = String(formData.get("start_date") ?? "");
  if (!name) return { error: "Name is required." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date)) return { error: "Start date must be YYYY-MM-DD." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("arcs")
    .update({ name, description: description || null, start_date })
    .eq("id", WINTER_ARC_ID);
  if (error) return { error: error.message };

  planChanged();
  return { error: null, message: "Saved." };
}

// --- Weeks ---------------------------------------------------------------

export async function updateWeekAction(
  weekId: string,
  input: { is_rest_week: boolean; connection_goal: number | null },
): Promise<AuthResult> {
  await requireAdmin();
  const goal = input.connection_goal;
  if (goal !== null && (!Number.isInteger(goal) || goal < 0 || goal > 50)) {
    return { error: "Connection goal must be a whole number from 0 to 50." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("weeks")
    .update({ is_rest_week: Boolean(input.is_rest_week), connection_goal: goal })
    .eq("id", weekId)
    .eq("arc_id", WINTER_ARC_ID);
  if (error) return { error: error.message };

  planChanged();
  return { error: null, message: "Saved." };
}

// --- Tasks ---------------------------------------------------------------

export async function createTaskAction(weekNumber: number, input: TaskInput): Promise<AuthResult> {
  await requireAdmin();
  const checked = validateTask(input);
  if ("error" in checked) return { error: checked.error };

  const supabase = createAdminClient();
  const { data: last } = await supabase
    .from("tasks")
    .select("sort_order")
    .eq("arc_id", WINTER_ARC_ID)
    .eq("week_number", weekNumber)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("tasks").insert({
    arc_id: WINTER_ARC_ID,
    week_number: weekNumber,
    sort_order: (last?.sort_order ?? 0) + 1,
    ...checked.value,
  });
  if (error) return { error: error.message };

  planChanged();
  return { error: null };
}

export async function updateTaskAction(taskId: string, input: TaskInput): Promise<AuthResult> {
  await requireAdmin();
  const checked = validateTask(input);
  if ("error" in checked) return { error: checked.error };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("tasks")
    .update(checked.value)
    .eq("id", taskId)
    .eq("arc_id", WINTER_ARC_ID);
  if (error) return { error: error.message };

  planChanged();
  return { error: null };
}

/** Deleting a task also deletes every member's entry for it (FK cascade). */
export async function deleteTaskAction(taskId: string): Promise<AuthResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("arc_id", WINTER_ARC_ID);
  if (error) return { error: error.message };

  planChanged();
  return { error: null };
}

/** Swaps sort_order with the neighbouring task in the same week + day group. */
export async function moveTaskAction(taskId: string, direction: "up" | "down"): Promise<AuthResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("arc_id", WINTER_ARC_ID)
    .maybeSingle();
  if (!task) return { error: "Task not found." };

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("arc_id", WINTER_ARC_ID)
    .eq("week_number", task.week_number);
  query = task.day_number === null ? query.is("day_number", null) : query.eq("day_number", task.day_number);
  const { data: siblings } = await query.order("sort_order").order("created_at");

  const list = siblings ?? [];
  const index = list.findIndex((t) => t.id === taskId);
  const swapWith = list[direction === "up" ? index - 1 : index + 1];
  if (index === -1 || !swapWith) return { error: null }; // already at the edge

  // Equal sort_orders (possible after edits) would make a swap a no-op, so
  // assign distinct values in the intended order.
  const [first, second] = direction === "up" ? [task, swapWith] : [swapWith, task];
  const lo = Math.min(task.sort_order, swapWith.sort_order);
  const hi = Math.max(task.sort_order, swapWith.sort_order, lo + 1);
  const results = await Promise.all([
    supabase.from("tasks").update({ sort_order: lo }).eq("id", first.id),
    supabase.from("tasks").update({ sort_order: hi }).eq("id", second.id),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  planChanged();
  return { error: null };
}
