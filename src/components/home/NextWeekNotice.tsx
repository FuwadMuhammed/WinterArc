const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export function nextWeekTooltip(week: number, durationWeeks: number, unlockDate?: Date): string {
  if (week >= durationWeeks) return "You're on the final week 🏁";
  return unlockDate
    ? `Week ${week + 1} unlocks on ${fmt(unlockDate)} 🔒`
    : `Week ${week + 1} unlocks next week 🔒`;
}

/** Sits under the current week's tasks: why next week is locked, and a nudge
 * to finish this one. Turns into a celebration once the week is done. */
export function NextWeekNotice({
  week,
  durationWeeks,
  unlockDate,
  weekDone,
}: {
  week: number;
  durationWeeks: number;
  unlockDate?: Date;
  weekDone: boolean;
}) {
  const isFinalWeek = week >= durationWeeks;
  const when = unlockDate ? `on ${fmt(unlockDate)}` : "next week";

  let emoji: string;
  let message: string;
  if (isFinalWeek) {
    emoji = weekDone ? "🏆" : "🏁";
    message = weekDone
      ? "You did it, the whole arc is done. Take a moment, you earned this."
      : "This is the final week. You've come all this way, finish it strong.";
  } else if (weekDone) {
    emoji = "🎉";
    message = `Week ${week} done, nice work! Week ${week + 1} unlocks ${when}. Rest up, you've earned it.`;
  } else {
    emoji = "🔒";
    message = `Week ${week + 1} unlocks ${when}. Keep going with this week's tasks, you're doing great.`;
  }

  return (
    <div className="rounded-3xl border border-border bg-panel px-6 py-5 text-center text-sm text-ink-muted">
      <span className="mr-1.5">{emoji}</span>
      {message}
    </div>
  );
}
