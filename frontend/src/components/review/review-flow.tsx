"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QuestionCard from "@/components/review/question-card";
import JudgePanel, { type SavePayload } from "@/components/review/judge-panel";
import {
  type MistakeNoteResponse,
  MistakeNoteStatusUpdateStatusEnum,
} from "@/generated";
import { attemptsApi, mistakeNotesApi } from "@/lib/api";
import { inputBase, labelBase } from "@/lib/form-styles";
import PageHeader from "@/components/layout/page-header";

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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

type Phase = "answering" | "revealed" | "correct" | "wrong";

export default function ReviewFlow({ noteId }: { noteId: string }) {
  const router = useRouter();

  const [note, setNote] = useState<MistakeNoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [userAnswer, setUserAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("answering");
  const [masterySuggested, setMasterySuggested] = useState(false);
  const [suggestedNextReviewAt, setSuggestedNextReviewAt] = useState<Date | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    mistakeNotesApi
      .getNoteV1MistakeNotesNoteIdGet({ noteId })
      .then(setNote)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [noteId]);

  async function handleJudge(isCorrect: boolean) {
    if (!note) return;
    setSaving(true);
    setError("");
    try {
      const attempt = await attemptsApi.createAttemptV1QuestionsQuestionIdAttemptsPost({
        questionId: note.question.id,
        attemptCreate: {
          isCorrect,
          userAnswer: userAnswer.trim() || undefined,
        },
      });
      setMasterySuggested(attempt.masterySuggested === true);
      setSuggestedNextReviewAt(attempt.suggestedNextReviewAt);
      setPhase(isCorrect ? "correct" : "wrong");
    } catch {
      setError("回答の記録に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(payload: SavePayload) {
    setSaving(true);
    setError("");
    try {
      await mistakeNotesApi.updateNoteV1MistakeNotesNoteIdPut({
        noteId,
        mistakeNoteUpdate: {
          // memo/learning are only edited on the incorrect branch
          ...(payload.memo !== undefined ? { memo: payload.memo } : {}),
          ...(payload.learning !== undefined
            ? { learning: payload.learning }
            : {}),
          // Same here: omitting the key keeps the tag, sending null clears it
          ...(payload.reasonTag !== undefined
            ? { reasonTag: payload.reasonTag }
            : {}),
          nextReviewAt: payload.nextReviewAt
            ? new Date(payload.nextReviewAt)
            : null,
        },
      });
      router.push("/");
    } catch {
      setError("保存に失敗しました。もう一度お試しください。");
      setSaving(false);
    }
  }

  async function handleMaster() {
    setSaving(true);
    setError("");
    try {
      await mistakeNotesApi.updateStatusV1MistakeNotesNoteIdStatusPut({
        noteId,
        mistakeNoteStatusUpdate: {
          status: MistakeNoteStatusUpdateStatusEnum.Mastered,
        },
      });
      router.push("/");
    } catch {
      setError("克服済みへの変更に失敗しました。もう一度お試しください。");
      setSaving(false);
    }
  }

  const header = <PageHeader title="復習" back="/" />;

  if (loading) {
    return (
      <>
        {header}
        <div
          className="p-5 sm:p-9 max-w-[760px] space-y-5"
          aria-busy="true"
        >
          <span className="sr-only">読み込み中</span>
          <div className="animate-pulse h-4 w-44 rounded bg-ink-lt" aria-hidden="true" />
          <div className="animate-pulse h-32 rounded-lg bg-ink-lt/70" aria-hidden="true" />
          <div className="animate-pulse h-24 rounded-lg bg-ink-lt/70" aria-hidden="true" />
        </div>
      </>
    );
  }

  if (notFound || !note) {
    return (
      <>
        {header}
        <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
          <span className="text-5xl mb-5" role="img" aria-label="">
            🔍
          </span>
          <h2 className="font-serif text-[18px] font-bold text-ink mb-2">
            この問題は見つかりませんでした
          </h2>
          <p className="text-[14px] text-muted max-w-xs leading-relaxed mb-7">
            削除されたか、URL が正しくない可能性があります。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-primary-dk transition-colors duration-150"
          >
            ホームへ戻る
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="p-5 sm:p-9 max-w-[760px] flex flex-col gap-5">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red bg-red-lt px-4 py-3 text-[13px] text-red"
          >
            {error}
          </div>
        )}

        {/* Meta: subject/unit, wrong count, current streak */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-bold text-ink bg-ink-lt tracking-[0.07em] uppercase px-2.5 py-[3px] rounded">
            {note.question.subject.name}
            {note.question.unit && ` › ${note.question.unit.name}`}
          </span>
          <span className="text-line" aria-hidden="true">
            ·
          </span>
          <span className="flex items-center gap-1 text-[12px] font-bold text-red">
            <XIcon />
            {note.wrongCount}回間違い
          </span>
          {note.correctStreak > 0 && (
            <>
              <span className="text-line" aria-hidden="true">
                ·
              </span>
              <span className="flex items-center gap-1 text-[12px] font-bold text-green">
                <CheckIcon />
                連続正解 {note.correctStreak}回
              </span>
            </>
          )}
        </div>

        <QuestionCard note={note} revealed={phase !== "answering"} />

        {phase === "answering" && (
          <>
            <div className="bg-surface border border-border rounded-lg px-6 sm:px-8 py-6 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              <label className={labelBase} htmlFor="user-answer">
                自分の答え（任意）
              </label>
              <textarea
                id="user-answer"
                rows={2}
                className={inputBase + " resize-y leading-relaxed"}
                placeholder="書かずに「答えを見る」へ進んでもOK"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => setPhase("revealed")}
              className="w-full py-4 rounded-lg bg-ink-lt border border-dashed border-line text-[14px] font-bold text-muted tracking-[0.02em] hover:bg-primary-lt hover:border-primary hover:text-primary transition-colors duration-150"
            >
              答えを見る
            </button>
          </>
        )}

        {phase !== "answering" && (
          <JudgePanel
            note={note}
            phase={phase}
            masterySuggested={masterySuggested}
            suggestedNextReviewAt={suggestedNextReviewAt}
            saving={saving}
            onJudge={handleJudge}
            onSave={handleSave}
            onMaster={handleMaster}
            onSkip={() => router.push("/")}
          />
        )}
      </div>
    </>
  );
}
