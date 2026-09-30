import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * A plain, cookie-free Supabase client for public, unauthenticated reads
 * (the arc's plan: arcs/weeks/tasks). It carries no per-user session, so its
 * queries are safe to share across requests and sit behind `unstable_cache`
 * — unlike `@/lib/supabase/server`'s client, which is bound to one request's
 * cookies and can't be reused or cached that way.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
