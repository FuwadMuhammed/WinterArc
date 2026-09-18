import Link from "next/link";
import { getDashboardData } from "@/lib/admin/dashboard-data";
import { StatCard } from "@/components/admin/StatCard";
import { ProgressBar } from "@/components/ProgressBar";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

export default async function AdminDashboardPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return <SetupNotice />;

  const data = await getDashboardData();
  const { weekRange } = data;
  const weekLabel = !weekRange
    ? "–"
    : weekRange.min === weekRange.max
      ? `${weekRange.min} / ${data.durationWeeks}`
      : `${weekRange.min}–${weekRange.max} / ${data.durationWeeks}`;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Dashboard</p>
        <h1 className="mt-1 font-heading text-3xl text-ink">{data.arcName}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {data.durationWeeks} weeks per member, starting the day they join
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Members"
          value={data.members.total}
          hint={`${data.members.active} active · ${data.members.completed} completed · ${data.members.abandoned} abandoned`}
        />
        <StatCard label="Members' weeks" value={weekLabel} hint="each member runs their own timeline" />
        <StatCard
          label="Tasks completed"
          value={data.entries.completed}
          hint={`${data.entries.total} entries total`}
        />
        <StatCard
          label="Completion rate"
          value={`${data.completionRate}%`}
          hint="of released tasks, across all members"
        />
      </section>

      <section className="rounded-3xl border border-border bg-panel px-6 py-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Per week</h2>
        <ul className="mt-4 divide-y divide-border">
          {data.perWeek.map((w) => (
            <li key={w.week_number} className="flex items-center gap-4 py-3">
              <span className="w-16 shrink-0 text-sm font-medium text-ink">
                Week {w.week_number}
              </span>
              <span className="w-16 shrink-0 text-xs text-ink-faint">
                {w.is_rest_week ? "Rest" : w.membersNow > 0 ? `${w.membersNow} here` : ""}
              </span>
              <ProgressBar
                fraction={w.possible ? w.done / w.possible : 0}
                accent={weekRange && w.week_number <= weekRange.max ? "green" : "blue"}
                className="flex-1"
              />
              <span className="w-24 shrink-0 text-right text-xs text-ink-muted">
                {w.done} / {w.possible} · {w.pct}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-border bg-panel px-6 py-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Recent submissions
          </h2>
          <Link
            href="/admin/submissions"
            className="text-xs font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
          >
            View all →
          </Link>
        </div>
        {data.recentSubmissions.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No proof submissions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {data.recentSubmissions.map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-medium text-ink">
                    {s.taskHeading}
                    <span className="ml-2 text-xs font-normal text-ink-faint">
                      W{s.week} · {s.category}
                    </span>
                  </p>
                  <p className="text-xs text-ink-faint">{formatDate(s.created_at)}</p>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{s.email}</p>
                <p className="mt-1 break-all text-sm text-ink">
                  {isUrl(s.note) ? (
                    <a
                      href={s.note}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue underline-offset-2 hover:underline"
                    >
                      {s.note}
                    </a>
                  ) : (
                    s.note
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
