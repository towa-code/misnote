import Link from "next/link";
import type { MistakeNoteResponse } from "@/generated";
import TagBadge from "@/components/reason-tag/tag-badge";
import { formatReviewDate, overdueDaysFrom } from "@/lib/review-date";

// Shared by the rows and the desktop column header so the columns stay aligned
export const ROW_GRID = "sm:grid sm:grid-cols-[1fr_92px_110px_210px] sm:gap-5";

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

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type Props = {
  note: MistakeNoteResponse;
  variant: "active" | "mastered";
  onChangeStatus: (noteId: string, next: "active" | "mastered") => void;
  busy: boolean;
};

export default function MistakeRow({
  note,
  variant,
  onChangeStatus,
  busy,
}: Props) {
  const overdueDays = note.nextReviewAt ? overdueDaysFrom(note.nextReviewAt) : 0;
  const isOverdue = variant === "active" && overdueDays > 0;

  return (
    <div
      className={[
        // Mobile: stacked. Desktop: one grid row aligned with the column header.
        "relative flex flex-col gap-3 px-3 py-4 border-b border-border last:border-b-0",
        ROW_GRID,
        "sm:items-center rounded-md transition-colors duration-150",
        isOverdue ? "bg-amber-lt" : "",
        variant === "active"
          ? isOverdue
            ? "hover:bg-[#FFF3CC]"
            : "hover:bg-navy-lt"
          : "",
      ].join(" ")}
    >
      {/* Whole-row tap target, matching how the home rows behave. Hidden from
          keyboard and assistive tech because the 復習する link below already
          exposes the same destination. */}
      {variant === "active" && (
        <Link
          href={`/review/${note.id}`}
          className="absolute inset-0 rounded-md"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Question, with subject/unit above and the memo underneath */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-y-1 text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1.5">
          {note.question.subject.name}
          {note.question.unit && (
            <>
              <span className="mx-1 opacity-40">›</span>
              {note.question.unit.name}
            </>
          )}
          {note.reasonTag && (
            <span className="ml-2">
              <TagBadge tag={note.reasonTag} />
            </span>
          )}
          {isOverdue && (
            <span className="inline-flex items-center gap-1 bg-amber text-white text-[10px] font-bold tracking-[0.04em] px-1.5 py-px rounded ml-2">
              <AlertIcon />
              {overdueDays}日遅れ
            </span>
          )}
        </div>
        <p
          className={[
            "text-[15px] font-medium leading-relaxed",
            isOverdue ? "text-amber" : "text-text",
          ].join(" ")}
        >
          {note.question.questionText}
        </p>
        {note.memo && (
          <p className="text-[12px] text-muted mt-1 truncate">{note.memo}</p>
        )}
      </div>

      {/* Meta: inline row on mobile, individual grid cells on desktop */}
      <div className="flex items-center gap-4 sm:contents">
        <span className="flex flex-col gap-0.5 whitespace-nowrap">
          <span className="flex items-center gap-1 text-[12px] text-red font-bold">
            <XIcon />
            {note.wrongCount}回間違い
          </span>
          {variant === "active" && note.correctStreak > 0 && (
            <span className="text-[11px] text-muted">
              連続正解 {note.correctStreak}回
            </span>
          )}
        </span>

        {variant === "active" ? (
          <span
            className={[
              "text-[12px] whitespace-nowrap",
              isOverdue
                ? "text-amber font-bold"
                : note.nextReviewAt
                  ? "text-muted"
                  : "text-[#CBD5E1]",
            ].join(" ")}
          >
            {note.nextReviewAt ? formatReviewDate(note.nextReviewAt) : "未設定"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 w-fit bg-green-lt text-green text-[11px] font-bold px-2 py-0.5 rounded">
            <CheckIcon />
            克服済み
          </span>
        )}
      </div>

      {/* Actions: above the row-wide link so they stay clickable */}
      <div className="relative z-10 flex gap-2 sm:justify-end">
        {variant === "active" ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onChangeStatus(note.id, "mastered")}
              className="px-3 py-1.5 rounded-[5px] border border-border bg-surface text-[12px] text-muted whitespace-nowrap hover:bg-navy-lt hover:border-[#CBD5E1] hover:text-navy disabled:opacity-50 transition-colors duration-150"
            >
              克服済みにする
            </button>
            <Link
              href={`/review/${note.id}`}
              className="px-3.5 py-1.5 rounded-[5px] bg-amber text-white text-[12px] font-bold whitespace-nowrap hover:bg-amber-dk transition-colors duration-150"
            >
              復習する
            </Link>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => onChangeStatus(note.id, "active")}
            className="px-3 py-1.5 rounded-[5px] border border-border bg-surface text-[12px] text-muted whitespace-nowrap hover:bg-navy-lt hover:border-[#CBD5E1] hover:text-navy disabled:opacity-50 transition-colors duration-150"
          >
            苦手に戻す
          </button>
        )}
      </div>
    </div>
  );
}
