"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_LABEL } from "@/lib/constants";
import type { SubmissionFilters as Filters } from "@/lib/admin/submissions-data";

const SELECT =
  "rounded-full border border-border bg-panel px-3.5 py-2 text-sm text-ink outline-none focus:border-primary";

export function SubmissionFilters({
  filters,
  weeks,
  members,
}: {
  filters: Filters;
  weeks: number[];
  members: { userArcId: string; email: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // any filter change starts from the first page
    router.push(`/admin/submissions${params.size ? `?${params}` : ""}`);
  }

  const active = filters.week !== null || filters.category !== null || filters.userArcId !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Week" value={filters.week ?? ""} onChange={(e) => set("week", e.target.value)} className={SELECT}>
        <option value="">All weeks</option>
        {weeks.map((w) => (
          <option key={w} value={w}>
            Week {w}
          </option>
        ))}
      </select>
      <select
        aria-label="Category"
        value={filters.category ?? ""}
        onChange={(e) => set("category", e.target.value)}
        className={SELECT}
      >
        <option value="">All categories</option>
        {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        aria-label="Member"
        value={filters.userArcId ?? ""}
        onChange={(e) => set("member", e.target.value)}
        className={`${SELECT} max-w-[240px]`}
      >
        <option value="">All members</option>
        {members.map((m) => (
          <option key={m.userArcId} value={m.userArcId}>
            {m.email}
          </option>
        ))}
      </select>
      {active && (
        <button
          type="button"
          onClick={() => router.push("/admin/submissions")}
          className="text-xs font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
