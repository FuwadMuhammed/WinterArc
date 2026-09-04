import type { SupabaseClient } from "@supabase/supabase-js";
import { WINTER_ARC_ID } from "@/lib/constants";
import type { Database } from "@/lib/database.types";

/**
 * There's only one arc in this MVP, so signing in doubles as joining it.
 * Safe to call repeatedly, ignores the unique-violation if already joined.
 */
export async function ensureJoined(supabase: SupabaseClient<Database>, userId: string) {
  const { error } = await supabase
    .from("user_arcs")
    .insert({ user_id: userId, arc_id: WINTER_ARC_ID });

  if (error && error.code !== "23505") {
    throw error;
  }
}
