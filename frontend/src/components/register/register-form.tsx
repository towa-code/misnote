"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MOCK_SUBJECTS = [
  { id: "s1", name: "数学" },
  { id: "s2", name: "英語" },
  { id: "s3", name: "理科" },
  { id: "s4", name: "社会" },
  { id: "s5", name: "国語" },
];

const MOCK_UNITS: Record<string, { id: string; name: string }[]> = {
  s1: [
    { id: "u1", name: "二次方程式" },
    { id: "u2", name: "因数分解" },
    { id: "u3", name: "図形" },
  ],
  s2: [
    { id: "u4", name: "文法" },
    { id: "u5", name: "長文読解" },
  ],
  s3: [
    { id: "u6", name: "物理" },
    { id: "u7", name: "化学" },
    { id: "u8", name: "生物" },
  ],
  s4: [
    { id: "u9", name: "歴史" },
    { id: "u10", name: "地理" },
  ],
  s5: [
    { id: "u11", name: "古文" },
    { id: "u12", name: "漢文" },
  ],
};

const inputBase =
  "w-full border border-border rounded-md px-3 py-2.5 text-[14px] bg-white text-text transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_#FFFBEB]";

const labelBase =
  "block text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1.5";

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

  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [answer, setAnswer] = useState("");
  const [memo, setMemo] = useState("");
  const [learning, setLearning] = useState("");
  const [nextReviewAt, setNextReviewAt] = useState("");

  const units = subjectId ? (MOCK_UNITS[subjectId] ?? []) : [];

  function handleSubjectChange(id: string) {
    setSubjectId(id);
    setUnitId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: POST /questions with { subject_id, unit_id, body, answer, memo, learning, next_review_at }
    router.push("/");
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-border px-9 py-[18px] flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center text-amber rounded-md p-1 transition-colors hover:bg-amber-lt"
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
        <div className="p-9 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1000px]">
          {/* Left: 問題・正解 */}
          <div>
            <div className={sectionHeading}>問題・正解</div>
            <div className="flex flex-col gap-[18px]">
              {/* 科目 + 単元 */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className={labelBase}>
                    科目<span className="text-amber ml-0.5">*</span>
                  </label>
                  <SelectWrapper>
                    <select
                      className={inputBase + " appearance-none pr-8 cursor-pointer"}
                      value={subjectId}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      required
                    >
                      <option value="">— 選択 —</option>
                      {MOCK_SUBJECTS.map((s) => (
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
                      disabled={units.length === 0}
                    >
                      <option value="">— 選択 —</option>
                      {units.map((u) => (
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
                  問題文<span className="text-amber ml-0.5">*</span>
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
                <label className={labelBase}>
                  正解<span className="text-amber ml-0.5">*</span>
                </label>
                <textarea
                  className={inputBase + " resize-y leading-relaxed"}
                  rows={3}
                  placeholder="例：x = 1, x = 3/2"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
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
                <label className={labelBase}>間違えた理由（任意）</label>
                <textarea
                  className={inputBase + " resize-y leading-relaxed"}
                  rows={3}
                  placeholder="例：符号のミスに注意。移項するとき符号が変わる"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
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
          <div className="lg:col-span-2 flex gap-2.5 mt-2">
            <button
              type="submit"
              className="bg-amber text-white border-none rounded-md px-8 py-3 text-[13px] font-bold cursor-pointer transition-colors hover:bg-amber-dk"
            >
              登録する
            </button>
            <Link
              href="/"
              className="bg-white text-muted border border-border rounded-md px-5 py-3 text-[13px] transition-colors hover:bg-navy-lt hover:border-[#CBD5E1] hover:text-text"
            >
              キャンセル
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
