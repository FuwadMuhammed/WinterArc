export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-panel px-6 py-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 font-heading text-4xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
