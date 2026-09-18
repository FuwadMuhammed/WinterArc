import type { PlanDay } from "@/lib/arc-logic";
import { track } from "@/lib/analytics";

function label(d: PlanDay): string {
  return `Week ${d.week}, Day ${d.day}`;
}

function behindLabel(days: number): string {
  return days === 1 ? "1 day to catch up on" : `${days} days to catch up on`;
}

/** Shown when the first unfinished plan day is behind today's calendar day.
 * Names both, so nobody mistakes "Today" for "where I am", and offers a jump
 * straight to the day to pick up from. `compact` is the Overview card. */
export function ResumeNotice({
  resume,
  today,
  daysBehind,
  onJump,
  compact = false,
}: {
  resume: PlanDay;
  today: PlanDay;
  daysBehind: number;
  onJump: () => void;
  compact?: boolean;
}) {
  const button = (
    <button
      type="button"
      onClick={() => {
        track("resume_jump", { from: compact ? "overview" : "daily", days_behind: daysBehind, ...resume });
        onJump();
      }}
      className="shrink-0 rounded-full bg-amber px-4 py-2 text-xs font-semibold text-white transition-check hover:opacity-90"
    >
      {compact ? "Continue in Daily" : `Jump to Day ${resume.day}`}
    </button>
  );

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-amber/20 bg-amber-soft px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber">Where you left off</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {label(resume)}
            <span className="font-normal text-ink-muted"> · {behindLabel(daysBehind)}</span>
          </p>
        </div>
        {button}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-amber/20 bg-amber-soft px-6 py-5">
      <div className="text-sm text-ink-muted">
        <p>
          <span className="mr-1.5">👋</span>
          <span className="font-semibold text-ink">You left off at {label(resume)}.</span> Today is {label(today)},{" "}
          {behindLabel(daysBehind)}.
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          Progress counts against the plan, not the calendar, so nothing is lost.
        </p>
      </div>
      {button}
    </div>
  );
}
