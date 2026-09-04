const BAR_COLOR: Record<string, string> = {
  green: "bg-green",
  blue: "bg-blue",
  orange: "bg-orange",
  purple: "bg-purple",
};

export function ProgressBar({
  fraction,
  accent = "green",
  className = "",
  dark = false,
}: {
  fraction: number;
  accent?: string;
  className?: string;
  dark?: boolean;
}) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full ${
        dark ? "bg-dark-border" : "bg-border"
      } ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${BAR_COLOR[accent] ?? BAR_COLOR.green}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
