"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AuthResult } from "@/lib/actions";
import type { UserArcStatus } from "@/lib/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeEqual } from "./session-token";
import { clearAdminSessionCookie, setAdminSessionCookie } from "./session";
import { requireAdmin } from "./dal";

export async function adminLoginAction(
  _prev: AuthResult | undefined,
  formData: FormData,
): Promise<AuthResult> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return { error: "Admin login is not configured." };

  // Evaluate both so timing doesn't reveal which one failed.
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  if (!(userOk && passOk)) return { error: "Invalid username or password." };

  await setAdminSessionCookie(username);
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

// --- Members -------------------------------------------------------------

const MEMBER_STATUSES: UserArcStatus[] = ["active", "completed", "abandoned"];

function memberChanged() {
  revalidatePath("/admin/members");
  revalidatePath("/admin");
  revalidatePath("/"); // the member's own view of their arc
}

export async function setMemberStatusAction(
  userArcId: string,
  status: UserArcStatus,
): Promise<AuthResult> {
  await requireAdmin();
  if (!MEMBER_STATUSES.includes(status)) return { error: "Unknown status." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("user_arcs").update({ status }).eq("id", userArcId);
  if (error) return { error: error.message };

  memberChanged();
  return { error: null };
}

/** Wipes every task entry for a member but keeps their membership. */
export async function resetMemberProgressAction(userArcId: string): Promise<AuthResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("task_entries").delete().eq("user_arc_id", userArcId);
  if (error) return { error: error.message };

  memberChanged();
  return { error: null };
}

/** Removes the membership (entries cascade). The auth account is untouched,
 * so the person can sign in and join again. */
export async function removeMemberAction(userArcId: string): Promise<AuthResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("user_arcs").delete().eq("id", userArcId);
  if (error) return { error: error.message };

  memberChanged();
  return { error: null };
}

