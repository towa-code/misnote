// Helpers for the user-set next_review_at date, shared by the home and mistake screens.

function startOfDay(value: string | Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

// "今日" for today, otherwise "6月28日"
export function formatReviewDate(value: string | Date): string {
  const date = startOfDay(value);
  if (date.getTime() === startOfDay(new Date()).getTime()) return "今日";
  return date.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
}

// Days the review date is past due; 0 when it is today or still ahead
export function overdueDaysFrom(value: string | Date): number {
  const diff = startOfDay(new Date()).getTime() - startOfDay(value).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}
