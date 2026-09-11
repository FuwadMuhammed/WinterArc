import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { TaskEntry } from "@/lib/database.types";

type AdminClient = ReturnType<typeof createAdminClient>;

const PAGE = 1000; // PostgREST's default max rows per request

export type CompletedRow = Pick<TaskEntry, "task_id" | "user_arc_id" | "created_at">;

/** Every completed entry across all members, paginated past the 1000-row cap. */
export async function fetchAllCompleted(supabase: AdminClient): Promise<CompletedRow[]> {
  const rows: CompletedRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("task_entries")
      .select("task_id, user_arc_id, created_at")
      .eq("completed", true)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export type AuthUserInfo = { email: string; avatarUrl: string | null; lastSignInAt: string | null };

/** auth.users lookup by id. There's no profiles table, so this is the only
 * place emails and avatars live, and it needs the service role. */
export async function fetchAuthUsers(supabase: AdminClient): Promise<Map<string, AuthUserInfo>> {
  const map = new Map<string, AuthUserInfo>();
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw error;
    for (const u of data.users) {
      const meta = (u.user_metadata ?? {}) as { avatar_url?: string; picture?: string };
      map.set(u.id, {
        email: u.email ?? "(no email)",
        avatarUrl: meta.avatar_url ?? meta.picture ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
      });
    }
    if (data.users.length < PAGE) return map;
  }
}
