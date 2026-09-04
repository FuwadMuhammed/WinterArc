import { CategoryIcon, accentColor } from "./CategoryIcon";
import { ProgressBar } from "./ProgressBar";

export function CategoryProgressRow({
  category,
  done,
  total,
  dark = false,
  bare = false,
}: {
  category: string;
  done: number;
  total: number;
  dark?: boolean;
  /** Render without panel-row padding/divider, e.g. inside the dark recap. */
  bare?: boolean;
}) {
  const accent = accentColor(category);

  return (
    <div className={bare ? "flex items-center gap-3" : "panel-row flex items-center gap-3 px-6 py-4"}>
      {!bare && <CategoryIcon category={category} size={32} />}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-sm font-medium ${dark ? "text-dark-ink" : "text-ink"}`}>{category}</p>
          <p className={`text-xs tabular-nums ${dark ? "text-dark-ink-muted" : "text-ink-muted"}`}>
            {done}/{total}
          </p>
        </div>
        <ProgressBar
          fraction={total > 0 ? done / total : 0}
          accent={accent}
          dark={dark}
          className="mt-1.5"
        />
      </div>
    </div>
  );
}
