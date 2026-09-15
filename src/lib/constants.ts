import type { TaskCategory } from "@/lib/database.types";

export const WINTER_ARC_ID = "11111111-1111-1111-1111-111111111111";

export const SITE_URL = "https://winter-arc-wheat.vercel.app";

export const SITE_NAME = "Winter Arc";
export const SITE_TITLE = "Winter Arc – A 12-Week Winter Challenge for Designers";
export const SITE_TAGLINE = "A 12-week winter challenge for designers";
export const SITE_DESCRIPTION =
  "Winter Arc is a free 12-week challenge for UX, UI and product designers. Show up every day for a small task, ship a deliverable every week, keep your streak alive, and finish the winter a better designer.";
export const SITE_KEYWORDS = [
  "winter arc",
  "designers winter arc",
  "design challenge",
  "12 week design challenge",
  "UX design challenge",
  "UI design practice",
  "product design",
  "daily UI",
  "design streak",
  "build in public",
  "UX designer",
  "UI designer",
];

export function dailyShareText(arcName: string, day: number): string {
  return `I just completed Day ${day} of ${arcName}. Join me on the journey to become a better designer.`;
}

export function weeklyShareText(arcName: string, week: number): string {
  return `I just completed Week ${week}'s deliverable of ${arcName}. Join me on the journey to become a better designer.`;
}

export function weekStreakShareText(arcName: string, week: number): string {
  return `I just finished Week ${week} of ${arcName}, showing up every day. Join me on the journey to become a better designer.`;
}

export function arcCompleteShareText(arcName: string, totalWeeks: number): string {
  return `I just completed all ${totalWeeks} weeks of ${arcName}. Join me on the journey to become a better designer.`;
}

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
