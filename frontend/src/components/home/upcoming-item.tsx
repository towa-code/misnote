import Link from "next/link";
import { XIcon, type ReviewItemData } from "@/components/home/review-item";

// "明日" for tomorrow, "7/10（金）" for later dates, "未設定" when null
function formatUpcomingDate(isoDate: string | null): string {
  if (!isoDate) return "未設定";
  const date = new Date(isoDate);
  date.setHours(0, 0, 0, 0);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  if (date.getTime() === tomorrow.getTime()) return "明日";
  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

type Props = {
  item: ReviewItemData;
};

// Date-led, toned-down row for scheduled/unscheduled (non-today) notes
export default function UpcomingItem({ item }: Props) {
  const isUnscheduled = item.nextReviewAt === null;

  return (
    <Link
      href={`/review/${item.id}`}
      className={[
        "grid items-center gap-5 px-2 py-3.5 border-b border-border last:border-b-0",
        "grid-cols-[80px_1fr_60px]",
        "rounded-md transition-colors duration-150 hover:bg-navy-lt",
      ].join(" ")}
    >
      {/* Left: date (the key info for a scheduled item) */}
      <span
        className={[
          "text-[13px] font-bold whitespace-nowrap",
          isUnscheduled ? "text-amber" : "text-navy-md",
        ].join(" ")}
      >
        {formatUpcomingDate(item.nextReviewAt)}
      </span>

      {/* Middle: subject + question, toned down */}
      <div>
        <div className="flex items-center text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1 opacity-75">
          {item.subjectName}
          {item.unitName && (
            <>
              <span className="mx-1 opacity-40">›</span>
              {item.unitName}
            </>
          )}
        </div>
        <p className="text-[14px] text-muted leading-relaxed">
          {item.questionBody}
        </p>
      </div>

      {/* Right: wrong count, muted (urgency color is reserved for today) */}
      <span className="flex items-center justify-end gap-1 text-[12px] text-muted font-bold whitespace-nowrap">
        <XIcon />
        {item.wrongCount}
      </span>
    </Link>
  );
}
