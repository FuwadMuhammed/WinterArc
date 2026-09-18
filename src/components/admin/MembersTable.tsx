"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { ProgressBar } from "@/components/ProgressBar";
import type { Member } from "@/lib/admin/members-data";
import {
  removeMemberAction,
  resetMemberProgressAction,
  setMemberStatusAction,
} from "@/lib/admin/actions";
import type { UserArcStatus } from "@/lib/database.types";

const STATUS_OPTIONS: { value: UserArcStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "abandoned", label: "Abandoned" },
];

const STATUS_TONE: Record<UserArcStatus, string> = {
  active: "bg-green-soft text-green",
  completed: "bg-blue-soft text-blue",
  abandoned: "bg-surface text-ink-muted",
};

type Filter = "all" | UserArcStatus;
type Pending = { kind: "reset" | "remove"; member: Member } | null;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function MembersTable({ members }: { members: Member[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirm, setConfirm] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(
      (m) => (filter === "all" || m.status === filter) && (!q || m.email.toLowerCase().includes(q)),
    );
  }, [members, query, filter]);

  function run(member: Member, action: () => Promise<{ error: string | null }>) {
    setError(null);
    setBusyId(member.userArcId);
    startTransition(async () => {
      const result = await action();
      setBusyId(null);
      setConfirm(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function changeStatus(member: Member, status: UserArcStatus) {
    if (status === member.status) return;
    run(member, () => setMemberStatusAction(member.userArcId, status));
  }

  function confirmPending() {
    if (!confirm) return;
    const { kind, member } = confirm;
    run(member, () =>
      kind === "reset"
        ? resetMemberProgressAction(member.userArcId)
        : removeMemberAction(member.userArcId),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by email"
          className="w-full max-w-xs rounded-xl border border-border bg-page px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary"
        />
        <div className="flex gap-1 rounded-full border border-border bg-panel p-1">
          {(["all", "active", "completed", "abandoned"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-check ${
                filter === f ? "bg-primary text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-ink-faint">
          {visible.length} of {members.length}
        </span>
      </div>

      {error && (
        <p className="rounded-xl border border-red/20 bg-red-soft px-4 py-2 text-sm text-red">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-3xl border border-border bg-panel">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-6 py-4 font-semibold">Member</th>
              <th className="px-4 py-4 font-semibold">Joined</th>
              <th className="px-4 py-4 font-semibold">Status</th>
              <th className="px-4 py-4 font-semibold">Progress</th>
              <th className="px-4 py-4 font-semibold">Last active</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-ink-muted">
                  No members match.
                </td>
              </tr>
            )}
            {visible.map((m) => {
              const busy = pending && busyId === m.userArcId;
              return (
                <tr key={m.userArcId} className={busy ? "opacity-50" : ""}>
                  <td className="max-w-[280px] px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-[11px] font-medium text-white">
                        {m.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.avatarUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials(m.email)
                        )}
                      </span>
                      <span className="truncate font-medium text-ink">{m.email}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                    {formatDate(m.joinedAt)}
                    <span className="ml-1 text-xs text-ink-faint">· week {m.currentWeek}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.status}
                      disabled={!!busy}
                      onChange={(e) => changeStatus(m, e.target.value as UserArcStatus)}
                      aria-label={`Status for ${m.email}`}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-semibold outline-none ${STATUS_TONE[m.status]}`}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 shrink-0">
                        <ProgressBar fraction={m.possible ? m.done / m.possible : 0} />
                      </div>
                      <span className="shrink-0 text-xs text-ink-muted">
                        {m.done}/{m.possible} · {m.pct}%
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                    {formatDate(m.lastActiveAt)}
                    <span className="ml-1 text-xs text-ink-faint">· {m.completedCount} done</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right">
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => setConfirm({ kind: "reset", member: m })}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted transition-check hover:bg-surface hover:text-ink"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => setConfirm({ kind: "remove", member: m })}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-red transition-check hover:bg-red-soft"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmSheet
        open={confirm?.kind === "reset"}
        onClose={() => setConfirm(null)}
        title="Reset progress?"
        description={`Every task entry for ${confirm?.member.email} will be deleted. Their membership stays. This can't be undone.`}
        confirmLabel="Reset progress"
        onConfirm={confirmPending}
        pending={pending}
      />
      <ConfirmSheet
        open={confirm?.kind === "remove"}
        onClose={() => setConfirm(null)}
        title="Remove from the arc?"
        description={`${confirm?.member.email} and all their progress will be removed from the Winter Arc. Their account is kept, so they can join again.`}
        confirmLabel="Remove member"
        onConfirm={confirmPending}
        pending={pending}
      />
    </div>
  );
}
