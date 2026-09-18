import type { TaskCategory } from "@/lib/database.types";

export const WINTER_ARC_ID = "11111111-1111-1111-1111-111111111111";

export const SITE_URL = "https://winterarc.byfu.app";

export const SITE_NAME = "Winter Arc";
export const AUTHOR_NAME = "Fuwad";
export const INSTAGRAM_URL = "https://www.instagram.com/fuwad.design";
export const LINKEDIN_URL = "https://www.linkedin.com/in/fuwad/";
export const CONTACT_EMAIL = "fuwadmuhd@gmail.com";
export const SITE_TITLE = "Winter Arc – A 12-Week Winter Challenge for Designers";
export const SITE_TAGLINE = "A 12-week winter challenge for designers";
export const SITE_DESCRIPTION =
  "Winter Arc is a free 12-week challenge for designers with two end results: a small product you actually ship, and a case study deck that tells its story. A small task every day, a deliverable every week, real conversations along the way.";
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

// Enum values are historical; the labels are what the plan means by them now.
export const CATEGORY_LABEL: Record<string, string> = {
  ui_practice: "Design",
  connection: "Connection",
  learn_explain: "Case Study",
  rotating_lens: "Research",
  build_public: "Build",
  reflection: "Catch Up",
};

export const CATEGORY_ACCENT: Record<string, "green" | "blue" | "orange" | "purple"> = {
  Design: "green",
  Connection: "orange",
  "Case Study": "blue",
  Research: "purple",
  Build: "purple",
  "Catch Up": "blue",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  Design: "🎨",
  Connection: "💬",
  "Case Study": "📽️",
  Research: "🔍",
  Build: "🚀",
  "Catch Up": "☕",
};

/** Cycled per task card for visual variety, like a notebook of colored tabs. */
export const TASK_CARD_PALETTE = ["#F2F2E8", "#E1F1E6", "#F7EDEC", "#F0E9F0", "#E8F1FA", "#EDF0F9"];

export function taskCardColor(index: number): string {
  return TASK_CARD_PALETTE[index % TASK_CARD_PALETTE.length];
}
