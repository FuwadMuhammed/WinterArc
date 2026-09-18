import Link from "next/link";
import { getTasksData } from "@/lib/admin/tasks-data";
import { ArcSettingsForm } from "@/components/admin/ArcSettingsForm";
import { WeekEditor } from "@/components/admin/WeekEditor";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return <SetupNotice />;

  const params = await searchParams;
  const requested = Number(params.week);
  const data = await getTasksData(Number.isInteger(requested) ? requested : null);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Tasks &amp; Weeks</p>
        <h1 className="mt-1 font-heading text-3xl text-ink">Plan editor</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Changes go live for every member immediately.
        </p>
      </header>

      <ArcSettingsForm arc={data.arc} />

      <nav aria-label="Weeks" className="flex flex-wrap gap-2">
        {data.weeks.map((w) => {
          const selected = w.id === data.selectedWeek.id;
          return (
            <Link
              key={w.id}
              href={`/admin/tasks?week=${w.week_number}`}
              aria-current={selected ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-check ${
                selected
                  ? "border-primary bg-primary font-semibold text-white"
                  : "border-border bg-panel text-ink hover:border-primary"
              }`}
            >
              {w.week_number}
              {w.is_rest_week && <span className="ml-1 text-xs opacity-70">rest</span>}
              <span className={`ml-1.5 text-xs ${selected ? "opacity-70" : "text-ink-faint"}`}>
                {data.taskCountByWeek[w.week_number] ?? 0}
              </span>
            </Link>
          );
        })}
      </nav>

      <WeekEditor key={data.selectedWeek.id} week={data.selectedWeek} tasks={data.tasks} />
    </div>
  );
}
