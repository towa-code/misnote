"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SubjectResponse, UnitResponse } from "@/generated";
import { questionsApi, subjectsApi, unitsApi } from "@/lib/api";

const inputBase =
  "w-full border border-border rounded-md px-3 py-2.5 text-[14px] bg-white text-text transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_#FFFBEB]";

const labelBase =
  "flex items-center text-[12px] font-bold text-navy-md tracking-[0.05em] mb-1.5";

// Explicit "必須" badge: clearer for students than a bare asterisk
function RequiredBadge() {
  return (
    <span className="ml-1.5 rounded bg-amber px-1.5 py-px text-[10px] font-bold tracking-normal text-white">
      必須
    </span>
  );
}

const sectionHeading =
  "font-serif text-[13px] font-bold tracking-[0.06em] uppercase pb-2.5 border-b-2 border-navy mb-5";

function ChevronLeftIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 8L1 3h10z" />
    </svg>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
        <ChevronDownIcon />
      </span>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [answer, setAnswer] = useState("");
  const [memo, setMemo] = useState("");
  const [learning, setLearning] = useState("");
  const [nextReviewAt, setNextReviewAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    subjectsApi.listSubjectsV1SubjectsGet().then(setSubjects);
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    unitsApi
      .listUnitsV1SubjectsSubjectIdUnitsGet({ subjectId })
      .then(setUnits);
  }, [subjectId]);

  const visibleUnits = subjectId ? units : [];

  function handleSubjectChange(id: string) {
    setSubjectId(id);
    setUnitId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await questionsApi.createQuestionV1QuestionsPost({
        questionCreate: {
          subjectId,
          unitId: unitId || undefined,
          questionText: questionBody,
          correctAnswer: answer || undefined,
          memo,
          learning: learning || undefined,
          nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : undefined,
        },
      });
      router.push("/");
    } catch {
      setError("登録に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-border px-5 sm:px-9 py-[18px] flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center justify-center text-amber rounded-md p-2.5 -ml-2.5 transition-colors hover:bg-amber-lt"
          aria-label="戻る"
        >
          <ChevronLeftIcon />
        </Link>
        <h1 className="font-serif text-[20px] font-bold tracking-[0.02em]">
          問題を登録
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="p-5 sm:p-9 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1000px]">
          {/* Left: 問題・正解 */}
          <div>
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
                      <option value="">— 選択 —</option>
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
                  placeholder="例：次の方程式を解け：2x² − 5x + 3 = 0"
                  value={questionBody}
                  onChange={(e) => setQuestionBody(e.target.value)}
                  required
                />
              </div>

              {/* 正解 */}
              <div>
                <label className={labelBase}>正解（任意）</label>
                <textarea
                  className={inputBase + " resize-y leading-relaxed"}
                  rows={3}
                  placeholder="例：x = 1, x = 3/2　※記述式など答えが一意でない場合は省略可"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right: メモ・復習日 */}
          <div>
            <div className={sectionHeading}>メモ・復習日</div>

            <div className="bg-navy-lt border-l-[3px] border-navy rounded-r-md px-3.5 py-3 text-[12px] text-muted leading-relaxed mb-5">
              間違えた理由や気をつけることをメモしておくと、次の復習がより効果的になります。あとから編集することもできます。
            </div>

            <div className="flex flex-col gap-[18px]">
              {/* 間違えた理由 */}
              <div>
                <label className={labelBase}>
                  間違えた理由
                  <RequiredBadge />
                </label>
                <textarea
                  className={inputBase + " resize-y leading-relaxed"}
                  rows={3}
                  placeholder="例：符号のミスに注意。移項するとき符号が変わる"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  required
                />
              </div>

              {/* 今回学んだこと */}
              <div>
                <label className={labelBase}>今回学んだこと（任意）</label>
                <textarea
                  className={inputBase + " resize-y leading-relaxed"}
                  rows={3}
                  placeholder="例：移項するとき符号が反転することを公式として覚える"
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                />
              </div>

              {/* 次の復習日 */}
              <div className="max-w-[220px]">
                <label className={labelBase}>次の復習日（任意）</label>
                <input
                  type="date"
                  className={inputBase}
                  value={nextReviewAt}
                  onChange={(e) => setNextReviewAt(e.target.value)}
                />
                <p className="text-[11px] text-muted mt-1.5">
                  未設定の場合、苦手問題一覧に追加されます
                </p>
              </div>
            </div>
          </div>

          {/* Actions (full width) */}
          <div className="lg:col-span-2 flex flex-col gap-2.5 mt-2">
            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
              >
                {error}
              </p>
            )}
            <div className="flex gap-2.5">
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber text-white border-none rounded-md px-8 py-3 text-[13px] font-bold cursor-pointer transition-colors hover:bg-amber-dk disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "登録中…" : "登録する"}
              </button>
              <Link
                href="/"
                className="bg-white text-muted border border-border rounded-md px-5 py-3 text-[13px] transition-colors hover:bg-navy-lt hover:border-[#CBD5E1] hover:text-text"
              >
                キャンセル
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
