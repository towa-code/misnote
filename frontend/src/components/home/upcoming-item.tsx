import Link from "next/link";
import {
  XIcon,
  ChevronRightIcon,
  type ReviewItemData,
} from "@/components/home/review-item";

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
        "group grid items-center gap-4 sm:gap-5 px-3 py-3.5 border-b border-border last:border-b-0",
        "grid-cols-[72px_1fr_auto] sm:grid-cols-[88px_1fr_auto]",
        "rounded-md transition-colors duration-150 hover:bg-navy-lt active:bg-navy-lt",
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

      {/* Middle: subject + question (question stays readable — it's the row's content) */}
      <div>
        <div className="flex flex-wrap items-center text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1 opacity-75">
          {item.subjectName}
          {item.unitName && (
            <>
              <span className="mx-1 opacity-40">›</span>
              {item.unitName}
            </>
          )}
        </div>
        <p className="text-[14px] text-navy-md leading-relaxed">
          {item.questionBody}
        </p>
      </div>

      {/* Right: wrong count, muted (urgency color is reserved for today) */}
      <span className="flex items-center justify-end gap-1 text-[12px] text-muted font-bold whitespace-nowrap">
        <XIcon />
        {item.wrongCount}回
        <span
          className="hidden sm:block ml-1 text-muted/60 group-hover:text-amber group-hover:translate-x-0.5 transition-[color,transform] duration-150"
          aria-hidden="true"
        >
          <ChevronRightIcon />
        </span>
      </span>
    </Link>
  );
}
