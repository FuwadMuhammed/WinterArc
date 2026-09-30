"use client";

import { useEffect, useRef, useState } from "react";
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
  // The locked "next" button is disabled, so it never gets hover, focus, or
  // click events, which means the tooltip below it never had a way to show
  // up on a touch device. This state gives it a tap-to-reveal path too; the
  // hover/focus-visible classes stay for mouse and keyboard users.
  const [tipOpen, setTipOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!tipOpen) return;
    function onOutside(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setTipOpen(false);
    }
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [tipOpen]);

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
        // A native `disabled` button never dispatches click, focus, or
        // (on touch) tap events at all — not even to ancestors — so a tap
        // here used to do nothing and the tooltip below could never show on
        // a touch device. Keeping it a plain enabled button, just styled and
        // announced as locked, is what lets that tap open the tooltip.
        <span ref={wrapperRef} className="group relative inline-flex">
          <button
            type="button"
            aria-label={`Next week, locked. ${nextWeekTooltip(selectedWeek, durationWeeks, unlockDate)}`}
            aria-disabled="true"
            onClick={() => setTipOpen((v) => !v)}
            className={`${BUTTON_CLASS} cursor-default opacity-40`}
          >
            ›
          </button>
          <span
            role="tooltip"
            className={`pointer-events-none absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-xl bg-ink px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${
              tipOpen ? "opacity-100" : "opacity-0"
            }`}
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
