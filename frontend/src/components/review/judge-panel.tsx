"use client";

import { useState } from "react";
import type { MistakeNoteResponse } from "@/generated";
import TagPicker from "@/components/reason-tag/tag-picker";
import DateChip from "@/components/review-date/date-chip";
import { inputBase, labelBase } from "@/lib/form-styles";
import type { ReasonTag } from "@/lib/reason-tags";
import { formatSuggestion, toDateInput } from "@/lib/review-date";

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export type SavePayload = {
  memo?: string;
  learning?: string;
  // 正解時は送らない（＝現在のタグを維持）。不正解時は null も送りうる（＝解除）。
  reasonTag?: ReasonTag | null;
  nextReviewAt: string;
};

type Props = {
  note: MistakeNoteResponse;
  phase: "revealed" | "correct" | "wrong";
  masterySuggested: boolean;
  suggestedNextReviewAt: Date | null;
  saving: boolean;
  onJudge: (isCorrect: boolean) => void;
  onSave: (payload: SavePayload) => void;
  onMaster: () => void;
  onSkip: () => void;
};

export default function JudgePanel({
  note,
  phase,
  masterySuggested,
  suggestedNextReviewAt,
  saving,
  onJudge,
  onSave,
  onMaster,
  onSkip,
}: Props) {
  const [memo, setMemo] = useState(note.memo ?? "");
  const [learning, setLearning] = useState(note.learning ?? "");
  const [reasonTag, setReasonTag] = useState<ReasonTag | null>(note.reasonTag);
  const [nextReviewAt, setNextReviewAt] = useState(
    toDateInput(note.nextReviewAt)
  );

  // 提案は押すと日付欄に入るだけ。保存は下の「保存してホームへ」に任せる
  const suggestionChip = suggestedNextReviewAt && (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] text-muted">次回のおすすめ</span>
      <DateChip
        label={formatSuggestion(suggestedNextReviewAt)}
        selected={nextReviewAt === toDateInput(suggestedNextReviewAt)}
        disabled={saving}
        onClick={() => setNextReviewAt(toDateInput(suggestedNextReviewAt))}
      />
    </div>
  );

  if (phase === "revealed") {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => onJudge(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-lg bg-green text-white text-[15px] font-bold hover:opacity-88 disabled:opacity-50 transition-opacity duration-150"
        >
          <CheckIcon />
          正解
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onJudge(false)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-lg bg-red text-white text-[15px] font-bold hover:opacity-88 disabled:opacity-50 transition-opacity duration-150"
        >
          <XIcon />
          不正解
        </button>
      </div>
    );
  }

  if (phase === "correct") {
    return (
      <div className="border border-green rounded-lg overflow-hidden">
        <div className="bg-green px-5 py-3 flex items-center gap-2">
          <span className="text-white">
            <CheckIcon size={14} />
          </span>
          <span className="text-[13px] font-bold text-white tracking-[0.03em]">
            正解！次回の復習を設定
          </span>
        </div>

        <div className="bg-green-lt px-5 sm:px-6 py-5 flex flex-col gap-4">
          {masterySuggested && (
            <div className="flex items-center gap-2 bg-surface border border-green rounded-md px-3.5 py-2.5 text-[13px] font-bold text-green">
              <AwardIcon />
              3回連続で正解しています。克服済みにしますか？
            </div>
          )}

          {suggestionChip}

          <div className="max-w-[200px]">
            <label className={labelBase} htmlFor="next-review-at">
              次の復習日
            </label>
            <input
              id="next-review-at"
              type="date"
              className={inputBase}
              value={nextReviewAt}
              onChange={(e) => setNextReviewAt(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => onSave({ nextReviewAt })}
              className="bg-green text-white rounded-md px-7 py-2.5 text-[13px] font-bold hover:opacity-88 disabled:opacity-50 transition-opacity duration-150"
            >
              保存してホームへ
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onMaster}
              className={[
                "sm:ml-auto flex items-center gap-1.5 rounded-md border border-green px-4 py-2.5 text-[13px] font-bold disabled:opacity-50 transition-colors duration-150",
                masterySuggested
                  ? "bg-green text-white hover:opacity-88"
                  : "bg-surface text-green hover:bg-green-lt",
              ].join(" ")}
            >
              <AwardIcon />
              克服済みにする
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-red rounded-lg overflow-hidden">
      <div className="bg-red px-5 py-3 flex items-center gap-2">
        <span className="text-white">
          <PencilIcon />
        </span>
        <span className="text-[13px] font-bold text-white tracking-[0.03em]">
          メモを更新する
        </span>
      </div>

      <div className="bg-red-lt px-5 sm:px-6 py-5 flex flex-col gap-4">
        <div>
          <span className={labelBase + " block"}>間違いの種類</span>
          <TagPicker value={reasonTag} onChange={setReasonTag} disabled={saving} />
        </div>

        <div>
          <label className={labelBase} htmlFor="review-memo">
            間違えた理由
          </label>
          <textarea
            id="review-memo"
            rows={2}
            className={inputBase + " resize-y leading-relaxed"}
            placeholder="単なるミスで終わらせず、具体的に書いてみよう"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <p className="text-[11px] text-muted mt-1.5">
            どこでつまずいたかまで書いておくと、次に同じ形の問題で気づけます
          </p>
        </div>

        <div>
          <label className={labelBase} htmlFor="review-learning">
            今回学んだこと
          </label>
          <textarea
            id="review-learning"
            rows={2}
            className={inputBase + " resize-y leading-relaxed"}
            placeholder="似た問題にも対応できるようにまとめてみよう"
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
          />
          <p className="text-[11px] text-muted mt-1.5">
            解き方のコツとして残すと、初めて見る問題でも通用します
          </p>
        </div>

        {suggestionChip}

        <div className="max-w-[200px]">
          <label className={labelBase} htmlFor="next-review-at-wrong">
            次の復習日
          </label>
          <input
            id="next-review-at-wrong"
            type="date"
            className={inputBase}
            value={nextReviewAt}
            onChange={(e) => setNextReviewAt(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave({ memo, learning, reasonTag, nextReviewAt })}
            className="bg-primary text-white rounded-md px-7 py-2.5 text-[13px] font-bold hover:bg-primary-dk disabled:opacity-50 transition-colors duration-150"
          >
            保存してホームへ
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSkip}
            className="text-muted text-[13px] px-4 py-2.5 hover:text-text disabled:opacity-50 transition-colors duration-150"
          >
            メモをスキップ
          </button>
        </div>
      </div>
    </div>
  );
}
