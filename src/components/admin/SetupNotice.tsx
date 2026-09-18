export function SetupNotice() {
  return (
    <div className="rounded-3xl border border-amber/40 bg-panel px-6 py-5">
      <h1 className="text-sm font-semibold text-ink">Almost there</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Set <code className="rounded bg-surface px-1">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
        <code className="rounded bg-surface px-1">.env</code> (Supabase dashboard → Project
        Settings → API) and restart the dev server to load this page.
      </p>
    </div>
  );
}
