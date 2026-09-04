import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureJoined } from "@/lib/ensure-joined";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureJoined(supabase, data.user.id);
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=Could not sign in`);
}
