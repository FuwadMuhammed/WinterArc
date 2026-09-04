"use client";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === t.key ? "bg-primary text-white" : "text-ink-muted hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
