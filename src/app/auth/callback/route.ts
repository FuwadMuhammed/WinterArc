import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureJoined } from "@/lib/ensure-joined";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await ensureJoined(supabase, data.user.id);
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/?authError=${encodeURIComponent(error?.message ?? "Could not sign in")}`,
    );
  }

  // Supabase's own /auth/v1/verify sends failures (expired/used links) straight
  // to this URL with the error in the hash fragment (#error=...), which never
  // reaches the server. Only the browser can read it, so hand off to a tiny
  // client-side redirect that turns it into a normal, page-visible query param.
  return new NextResponse(
    `<!doctype html><script>
      var params = new URLSearchParams(location.hash.slice(1));
      var message = params.get("error_description") || "Could not sign in";
      location.replace("${origin}/?authError=" + encodeURIComponent(message.replace(/\\+/g, " ")));
    </script>`,
    { headers: { "content-type": "text/html" } },
  );
}
