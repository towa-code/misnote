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

// <input type="date"> 用の YYYY-MM-DD。日だけを扱うので UTC を挟まずローカル日付で組む
// （ローカルで作った Date を toISOString() に通すと日付が1日ずれる）
export function toDateInput(value: string | Date | null): string {
  if (!value) return "";
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// 今日から days 日後
export function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// 復習日提案チップのラベル。例：「8月7日（3日後）」
export function formatSuggestion(value: string | Date): string {
  const date = startOfDay(value);
  const days = Math.round(
    (date.getTime() - startOfDay(new Date()).getTime()) / 86_400_000
  );
  const relative = days === 1 ? "明日" : `${days}日後`;
  return `${formatReviewDate(date)}（${relative}）`;
}
