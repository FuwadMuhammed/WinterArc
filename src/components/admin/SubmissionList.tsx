import { CategoryIcon } from "@/components/CategoryIcon";
import type { Submission } from "@/lib/admin/submissions-data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUrl(s: string) {
  return /^https?:\/\/\S+$/i.test(s.trim());
}

export function SubmissionList({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border px-6 py-10 text-center text-sm text-ink-muted">
        No submissions match.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {submissions.map((s) => (
        <li key={s.id} className="rounded-3xl border border-border bg-panel px-6 py-5">
          <div className="flex items-start gap-4">
            <CategoryIcon category={s.categoryLabel} size={36} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm font-medium text-ink">
                  {s.taskHeading}
                  <span className="ml-2 text-xs font-normal text-ink-faint">
                    W{s.week}
                    {s.day ? ` · D${s.day}` : " · Weekly"} · {s.categoryLabel}
                  </span>
                </p>
                <p className="text-xs text-ink-faint">{formatDate(s.createdAt)}</p>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-ink text-[9px] font-medium text-white">
                  {s.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    s.email.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="truncate">{s.email}</span>
                {!s.completed && (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                    Not marked done
                  </span>
                )}
              </div>

              <p className="mt-3 break-words rounded-xl bg-page px-4 py-3 text-sm text-ink">
                {isUrl(s.note) ? (
                  <a
                    href={s.note.trim()}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue underline-offset-2 hover:underline"
                  >
                    {s.note.trim()}
                  </a>
                ) : (
                  s.note
                )}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
