import { CATEGORY_ACCENT, CATEGORY_EMOJI } from "@/lib/constants";

const ACCENT_CLASSES: Record<string, { bg: string }> = {
  green: { bg: "bg-green-soft" },
  blue: { bg: "bg-blue-soft" },
  orange: { bg: "bg-orange-soft" },
  purple: { bg: "bg-purple-soft" },
};

export function CategoryIcon({ category, size = 40 }: { category: string; size?: number }) {
  const accent = CATEGORY_ACCENT[category] ?? "blue";
  const { bg } = ACCENT_CLASSES[accent];
  const emoji = CATEGORY_EMOJI[category] ?? "✅";

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-xl ${bg}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  );
}

export function accentColor(category: string) {
  return CATEGORY_ACCENT[category] ?? "blue";
}
