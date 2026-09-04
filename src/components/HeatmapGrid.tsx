import type { HeatmapDay } from "@/lib/arc-logic";

const LEVEL_CLASSES = ["bg-border", "bg-primary/30", "bg-primary/60", "bg-primary"];
const COLUMNS = 20;

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.66) return 3;
  if (ratio > 0.33) return 2;
  return 1;
}

/** One small circle per day, wrapping at a fixed column count, chronological, not weekday-aligned. */
export function HeatmapGrid({ days }: { days: HeatmapDay[] }) {
  if (days.length === 0) return null;
  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}>
      {days.map((day) => (
        <div
          key={day.date}
          title={`${day.date} · ${day.count}`}
          className={`aspect-square rounded-[3px] ${LEVEL_CLASSES[levelFor(day.count, max)]}`}
        />
      ))}
    </div>
  );
}
