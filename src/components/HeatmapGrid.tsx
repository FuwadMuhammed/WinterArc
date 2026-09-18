/** One square per active plan day, filled from the left as days get done. Not
 * a calendar: a day completed late still fills the next square, so the run
 * never has gaps. At most one partial square, at the end, for the day in
 * progress. */
export function HeatmapGrid({ totalDays, completedDays }: { totalDays: number; completedDays: number }) {
  if (totalDays === 0) return null;
  const full = Math.floor(completedDays + 1e-9);
  const hasPartial = completedDays - full > 1e-9;

  return (
    <div className="grid grid-cols-11 gap-2 sm:grid-cols-[repeat(20,minmax(0,1fr))] sm:gap-2.5">
      {Array.from({ length: totalDays }, (_, i) => {
        const state = i < full ? "done" : i === full && hasPartial ? "partial" : "todo";
        const color =
          state === "done" ? "bg-primary" : state === "partial" ? "bg-primary/50" : "bg-border";
        return (
          <div
            key={i}
            title={`Day ${i + 1} of ${totalDays}${state === "done" ? " · done" : state === "partial" ? " · in progress" : ""}`}
            className={`aspect-square rounded-[3px] ${color}`}
          />
        );
      })}
    </div>
  );
}
