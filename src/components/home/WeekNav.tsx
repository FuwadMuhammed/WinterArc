"use client";

import { nextWeekTooltip } from "@/components/home/NextWeekNotice";

function formatRange(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

const BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-panel text-ink transition-check hover:border-primary disabled:cursor-default disabled:opacity-40 disabled:hover:border-border";

/** Prev/next between weeks 1..currentWeek. Future weeks stay locked, with a
 * tooltip saying when the next one opens. */
export function WeekNav({
  selectedWeek,
  currentWeek,
  durationWeeks,
  onChange,
  dateRange,
  unlockDate,
}: {
  selectedWeek: number;
  currentWeek: number;
  durationWeeks: number;
  onChange: (week: number) => void;
  dateRange?: { start: Date; end: Date };
  /** When the following week opens; shown in the locked "next" tooltip. */
  unlockDate?: Date;
}) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-border bg-panel px-4 py-3">
      <button
        type="button"
        aria-label="Previous week"
        disabled={selectedWeek <= 1}
        onClick={() => onChange(selectedWeek - 1)}
        className={BUTTON_CLASS}
      >
        ‹
      </button>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink">
          Week {selectedWeek} of {durationWeeks}
          {selectedWeek === currentWeek && (
            <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
              This week
            </span>
          )}
        </p>
        {dateRange && (
          <p className="text-xs text-ink-muted">{formatRange(dateRange.start, dateRange.end)}</p>
        )}
      </div>
      {selectedWeek >= currentWeek ? (
        // Disabled buttons don't get hover events, so the tooltip hangs off a wrapper.
        <span className="group relative inline-flex" tabIndex={0}>
          <button type="button" aria-label="Next week" disabled className={BUTTON_CLASS}>
            ›
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {nextWeekTooltip(selectedWeek, durationWeeks, unlockDate)}
          </span>
        </span>
      ) : (
        <button
          type="button"
          aria-label="Next week"
          onClick={() => onChange(selectedWeek + 1)}
          className={BUTTON_CLASS}
        >
          ›
        </button>
      )}
    </div>
  );
}
