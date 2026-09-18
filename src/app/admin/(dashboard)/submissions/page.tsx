import Link from "next/link";
import { getSubmissionsData, parseFilters, PAGE_SIZE } from "@/lib/admin/submissions-data";
import { SubmissionFilters } from "@/components/admin/SubmissionFilters";
import { SubmissionList } from "@/components/admin/SubmissionList";
import { SetupNotice } from "@/components/admin/SetupNotice";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return <SetupNotice />;

  const params = await searchParams;
  const data = await getSubmissionsData(parseFilters(params));
  const { filters } = data;

  function pageHref(page: number) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") next.set(k, v);
    if (page > 1) next.set("page", String(page));
    return `/admin/submissions${next.size ? `?${next}` : ""}`;
  }

  const first = (filters.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(filters.page * PAGE_SIZE, data.total);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Submissions</p>
        <h1 className="mt-1 font-heading text-3xl text-ink">
          {data.total} submission{data.total === 1 ? "" : "s"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every task entry with a note or proof link, newest first.
        </p>
      </header>

      <SubmissionFilters filters={filters} weeks={data.weeks} members={data.members} />

      <SubmissionList submissions={data.submissions} />

      {data.pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
          <p className="text-ink-muted">
            {first}–{last} of {data.total}
          </p>
          <div className="flex gap-2">
            <PageLink href={pageHref(filters.page - 1)} disabled={filters.page <= 1}>
              ← Previous
            </PageLink>
            <PageLink href={pageHref(filters.page + 1)} disabled={filters.page >= data.pageCount}>
              Next →
            </PageLink>
          </div>
        </nav>
      )}
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const cls = "rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium transition-check";
  if (disabled) return <span className={`${cls} text-ink-faint opacity-60`}>{children}</span>;
  return (
    <Link href={href} className={`${cls} text-ink hover:border-primary`}>
      {children}
    </Link>
  );
}
