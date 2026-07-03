"use client";

export type ReviewItemData = {
  id: string;
  subjectName: string;
  unitName?: string;
  questionBody: string;
  wrongCount: number;
  nextReviewAt: string; // ISO date string
  overdueDays: number;  // 0 = not overdue
};

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function formatReviewDate(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  if (date.getTime() === today.getTime()) return "今日";
  return date.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
}

type Props = {
  item: ReviewItemData;
  onClick: (id: string) => void;
};

export default function ReviewItem({ item, onClick }: Props) {
  const isOverdue = item.overdueDays > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(item.id)}
      onKeyDown={(e) => e.key === "Enter" && onClick(item.id)}
      className={[
        "grid items-center gap-6 px-2 py-[18px] border-b border-border last:border-b-0",
        "rounded-md cursor-pointer transition-colors duration-150",
        "grid-cols-[1fr_auto_auto]",
        isOverdue
          ? "bg-amber-lt hover:bg-[#FFF3CC]"
          : "hover:bg-navy-lt",
      ].join(" ")}
    >
      {/* Left: subject + question */}
      <div>
        <div className="flex items-center text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1.5">
          {item.subjectName}
          {item.unitName && (
            <>
              <span className="mx-1 opacity-40">›</span>
              {item.unitName}
            </>
          )}
          {isOverdue && (
            <span className="inline-flex items-center gap-1 bg-amber text-white text-[10px] font-bold tracking-[0.04em] px-1.5 py-px rounded ml-2">
              <AlertIcon />
              {item.overdueDays}日遅れ
            </span>
          )}
        </div>
        <p className={[
          "text-[15px] font-medium leading-relaxed",
          isOverdue ? "text-amber" : "text-text",
        ].join(" ")}>
          {item.questionBody}
        </p>
      </div>

      {/* Middle: wrong count */}
      <div className="flex items-center gap-1 text-[12px] text-red font-bold whitespace-nowrap">
        <XIcon />
        {item.wrongCount}回間違い
      </div>

      {/* Right: review date */}
      <div className="text-[12px] text-muted whitespace-nowrap text-right">
        {formatReviewDate(item.nextReviewAt)}
      </div>
    </div>
  );
}
