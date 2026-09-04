import type { TaskCategory } from "@/lib/database.types";

export const WINTER_ARC_ID = "11111111-1111-1111-1111-111111111111";

export const REAL_CATEGORIES: TaskCategory[] = [
  "ui_practice",
  "connection",
  "learn_explain",
  "rotating_lens",
  "build_public",
];

export const CATEGORY_LABEL: Record<string, string> = {
  ui_practice: "UI Practice",
  connection: "Connection",
  learn_explain: "Learn & Explain",
  rotating_lens: "Rotating Lens",
  build_public: "Build in Public",
  reflection: "Catch Up",
};

export const CATEGORY_ACCENT: Record<string, "green" | "blue" | "orange" | "purple"> = {
  "UI Practice": "green",
  Connection: "orange",
  "Learn & Explain": "blue",
  "Rotating Lens": "purple",
  "Build in Public": "purple",
  "Catch Up": "blue",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  "UI Practice": "🎨",
  Connection: "💬",
  "Learn & Explain": "💡",
  "Rotating Lens": "🔍",
  "Build in Public": "🚀",
  "Catch Up": "☕",
};

/** Cycled per task card for visual variety, like a notebook of colored tabs. */
export const TASK_CARD_PALETTE = ["#F2F2E8", "#E1F1E6", "#F7EDEC", "#F0E9F0", "#E8F1FA", "#EDF0F9"];

export function taskCardColor(index: number): string {
  return TASK_CARD_PALETTE[index % TASK_CARD_PALETTE.length];
}
