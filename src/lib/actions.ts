"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getHomeData } from "@/lib/arc-data";
import { ensureJoined } from "@/lib/ensure-joined";

export type AuthResult = { error: string | null; message?: string | null };

// --- Auth (sign-in doubles as join, since there's a single arc) ----------

export async function signInAction(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  await ensureJoined(supabase, data.user.id);
  return { error: null };
}

export async function signUpAction(email: string, password: string): Promise<AuthResult> {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: error.message };

  if (data.user && data.user.identities?.length === 0) {
    // Supabase returns a user object with no identities (instead of an error)
    // when the email already has an account, to avoid leaking which emails
    // are registered. No confirmation email is sent in this case.
    return {
      error:
        "An account with this email already exists. Try signing in, or use \"Forgot password?\" if you don't remember your password.",
    };
  }

  if (data.session && data.user) {
    // Email confirmation is off for this project, already signed in.
    await ensureJoined(supabase, data.user.id);
    return { error: null };
  }

  return { error: null, message: "Check your email to confirm your account." };
}

export async function signInWithGoogleAction() {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    throw new Error("Could not start Google sign-in");
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}

export async function resendConfirmationAction(email: string): Promise<AuthResult> {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: error.message };
  return { error: null, message: "Confirmation email resent. Check your inbox." };
}

export async function requestPasswordResetAction(email: string): Promise<AuthResult> {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });

  if (error) return { error: error.message };
  return { error: null, message: "Check your email for a password reset link." };
}

export async function updatePasswordAction(password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: error.message };
  return { error: null };
}

/** For a user who's already signed in but hasn't joined yet. */
export async function joinArcAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await ensureJoined(supabase, user.id);
  revalidatePath("/");
}

// --- Progress mutations -----------------------------------------------------

export async function setTaskEntry(taskId: string, completed: boolean, note: string) {
  const { userArc } = await getHomeData();
  if (!userArc) throw new Error("Not joined");
  const supabase = await createClient();

  const { error } = await supabase.from("task_entries").upsert(
    {
      user_arc_id: userArc.id,
      task_id: taskId,
      completed,
      note: note.trim() || null,
    },
    { onConflict: "user_arc_id,task_id" },
  );

  if (error) throw error;
  revalidatePath("/");
}

// --- Profile -----------------------------------------------------------------

/** Clears every entry and restarts the member's timeline, so Day 1 is today again. */
export async function resetArcProgress() {
  const { userArc } = await getHomeData();
  if (!userArc) throw new Error("Not joined");
  const supabase = await createClient();

  const { error } = await supabase.from("task_entries").delete().eq("user_arc_id", userArc.id);
  if (error) throw error;

  const { error: restartError } = await supabase
    .from("user_arcs")
    .update({ joined_at: new Date().toISOString() })
    .eq("id", userArc.id);
  if (restartError) throw restartError;
  revalidatePath("/");
}

export async function leaveArc() {
  const { userArc } = await getHomeData();
  if (!userArc) throw new Error("Not joined");
  const supabase = await createClient();

  const { error } = await supabase.from("user_arcs").delete().eq("id", userArc.id);
  if (error) throw error;
  revalidatePath("/");
}
