"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  type MistakeNoteResponse,
  MistakeNoteStatusUpdateStatusEnum,
  ResponseError,
  type SubjectResponse,
  type UnitResponse,
} from "@/generated";
import { RequiredBadge, SelectWrapper } from "@/components/form/field-parts";
import { mistakeNotesApi, questionsApi, subjectsApi, unitsApi } from "@/lib/api";
import { inputBase, labelBase, sectionHeading } from "@/lib/form-styles";
import PageHeader from "@/components/layout/page-header";

// 編集前の値。これと比べて未保存の変更があるかを判定する
type Snapshot = {
  subjectId: string;
  unitId: string;
  questionText: string;
  answer: string;
};

type Props = {
  questionId: string;
  // 苦手問題一覧を科目で絞り込んだ状態から来たときだけ渡る
  subjectFilter?: string;
};

export default function QuestionEditForm({ questionId, subjectFilter }: Props) {
  const router = useRouter();
  const returnHref = subjectFilter
    ? `/mistakes?subject=${encodeURIComponent(subjectFilter)}`
    : "/mistakes";

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [initial, setInitial] = useState<Snapshot | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState<MistakeNoteResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      questionsApi.getQuestionV1QuestionsQuestionIdGet({ questionId }),
      subjectsApi.listSubjectsV1SubjectsGet(),
    ])
      .then(async ([question, subjectList]) => {
        const snapshot = {
          subjectId: question.subject.id,
          unitId: question.unit?.id ?? "",
          questionText: question.questionText,
          answer: question.correctAnswer ?? "",
        };
        setSubjects(subjectList);
        setInitial(snapshot);
        setSubjectId(snapshot.subjectId);
        setUnitId(snapshot.unitId);
        setQuestionText(snapshot.questionText);
        setAnswer(snapshot.answer);
        if (question.mistakeNoteId) {
          // 状態の欄が出せないだけなので、取れなくても編集は続けられる
          const fetched = await mistakeNotesApi
            .getNoteV1MistakeNotesNoteIdGet({ noteId: question.mistakeNoteId })
            .catch(() => null);
          setNote(fetched);
        }
      })
      .catch((err) => {
        if (err instanceof ResponseError && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError("問題の取得に失敗しました。再読み込みしてください。");
        }
      })
      .finally(() => setLoading(false));
  }, [questionId]);

  useEffect(() => {
    if (!subjectId) return;
    unitsApi
      .listUnitsV1SubjectsSubjectIdUnitsGet({ subjectId })
      .then(setUnits);
  }, [subjectId]);

  const visibleUnits = subjectId ? units : [];

  const dirty =
    initial !== null &&
    (subjectId !== initial.subjectId ||
      unitId !== initial.unitId ||
      questionText !== initial.questionText ||
      answer !== initial.answer);

  function handleSubjectChange(id: string) {
    setSubjectId(id);
    setUnitId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // PUT は全置換なので、空にした単元・正解は null で送って消す
      await questionsApi.updateQuestionV1QuestionsQuestionIdPut({
        questionId,
        questionUpdate: {
          subjectId,
          unitId: unitId || null,
          questionText,
          correctAnswer: answer || null,
        },
      });
      router.push(returnHref);
    } catch {
      setError("保存に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "この問題を削除しますか？\n間違いノートと解答履歴も一緒に削除されます。"
      )
    )
      return;
    setError("");
    setSubmitting(true);
    try {
      await questionsApi.deleteQuestionV1QuestionsQuestionIdDelete({ questionId });
      router.push(returnHref);
    } catch {
      setError("削除に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  }

  async function handleChangeStatus(next: "active" | "mastered") {
    if (!note) return;
    setError("");
    setSubmitting(true);
    try {
      await mistakeNotesApi.updateStatusV1MistakeNotesNoteIdStatusPut({
        noteId: note.id,
        mistakeNoteStatusUpdate: {
          status:
            next === "mastered"
              ? MistakeNoteStatusUpdateStatusEnum.Mastered
              : MistakeNoteStatusUpdateStatusEnum.Active,
        },
      });
      router.push(returnHref);
    } catch {
      setError("状態の変更に失敗しました。");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="問題を編集" back={returnHref} />
        <div className="p-5 sm:p-9 max-w-[560px] space-y-4" aria-busy="true">
          <span className="sr-only">読み込み中</span>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse h-16 rounded-md bg-ink-lt/70"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || initial === null) {
    return (
      <div>
        <PageHeader title="問題を編集" back={returnHref} />
        <div className="p-5 sm:p-9 max-w-[560px]">
          <p
            role="alert"
            className="rounded-md border border-red bg-red-lt px-4 py-3 text-[13px] text-red"
          >
            {notFound ? "問題が見つかりません。" : error}
          </p>
          <Link
            href={returnHref}
            className="mt-4 inline-block text-[13px] text-primary underline"
          >
            苦手問題一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="問題を編集" back={returnHref} />

      <div className="p-5 sm:p-9 max-w-[560px] flex flex-col gap-10">
        <form onSubmit={handleSubmit}>
          <div className={sectionHeading}>問題・正解</div>
          <div className="flex flex-col gap-[18px]">
            {/* 科目 + 単元 */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className={labelBase}>
                  科目
                  <RequiredBadge />
                </label>
                <SelectWrapper>
                  <select
                    className={inputBase + " appearance-none pr-8 cursor-pointer"}
                    value={subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    required
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>
              <div>
                <label className={labelBase}>単元（任意）</label>
                <SelectWrapper>
                  <select
                    className={
                      inputBase +
                      " appearance-none pr-8 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    }
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    disabled={visibleUnits.length === 0}
                  >
                    <option value="">— 選択 —</option>
                    {visibleUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </SelectWrapper>
              </div>
            </div>

            {/* 問題文 */}
            <div>
              <label className={labelBase}>
                問題文
                <RequiredBadge />
              </label>
              <textarea
                className={inputBase + " resize-y leading-relaxed"}
                rows={5}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />
            </div>

            {/* 正解 */}
            <div>
              <label className={labelBase}>正解（任意）</label>
              <textarea
                className={inputBase + " resize-y leading-relaxed"}
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 mt-6">
            {error && (
              <p
                role="alert"
                className="rounded-md border border-red bg-red-lt px-4 py-3 text-[13px] text-red"
              >
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="submit"
                disabled={submitting || !dirty}
                className="bg-primary text-white border-none rounded-md px-8 py-3 text-[13px] font-bold cursor-pointer transition-colors hover:bg-primary-dk disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "保存中…" : "保存する"}
              </button>
              <Link
                href={returnHref}
                className="bg-white text-muted border border-border rounded-md px-5 py-3 text-[13px] transition-colors hover:bg-ink-lt hover:border-line hover:text-text"
              >
                キャンセル
              </Link>
              {/* Kept apart from 保存 so it isn't hit by accident */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="sm:ml-auto bg-white text-red border border-red rounded-md px-5 py-3 text-[13px] transition-colors hover:bg-red-lt disabled:opacity-50"
              >
                この問題を削除
              </button>
            </div>
          </div>
        </form>

        {note && (
          <section>
            <div className={sectionHeading}>状態</div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-text">
                いまは「{note.status === "mastered" ? "克服済み" : "苦手中"}」です
              </span>
              {note.status === "mastered" ? (
                <button
                  type="button"
                  onClick={() => handleChangeStatus("active")}
                  disabled={submitting || dirty}
                  className="rounded-md border border-border bg-surface px-4 py-2.5 text-[13px] text-muted transition-colors hover:bg-ink-lt hover:border-line hover:text-ink disabled:opacity-50"
                >
                  やっぱり苦手
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleChangeStatus("mastered")}
                  disabled={submitting || dirty}
                  className="rounded-md border border-green bg-surface px-4 py-2.5 text-[13px] font-bold text-green transition-colors hover:bg-green-lt disabled:opacity-50"
                >
                  もう完璧！
                </button>
              )}
            </div>
            {dirty && (
              <p className="text-[11px] text-muted mt-2">
                先に変更を保存してください
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
