"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MistakeTabs, { type MistakeTab } from "@/components/mistakes/mistake-tabs";
import MistakeRow, { ROW_GRID } from "@/components/mistakes/mistake-row";
import MistakesEmptyState from "@/components/mistakes/empty-state";
import TagFilterChips, {
  matchesTagFilter,
  type TagFilter,
} from "@/components/mistakes/tag-filter";
import SubjectFilterSelect from "@/components/mistakes/subject-filter";
import type { MistakeNoteResponse, SubjectResponse } from "@/generated";
import { mistakeNotesApi, subjectsApi } from "@/lib/api";
import PageHeader from "@/components/layout/page-header";

type Props = {
  // URL の ?subject=。科目・単元管理や編集画面から戻ったときに付く
  initialSubjectFilter?: string;
};

export default function MistakesContent({ initialSubjectFilter }: Props) {
  const [activeNotes, setActiveNotes] = useState<MistakeNoteResponse[]>([]);
  const [masteredNotes, setMasteredNotes] = useState<MistakeNoteResponse[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [tab, setTab] = useState<MistakeTab>("active");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(
    initialSubjectFilter ?? null
  );
  const [tagFilter, setTagFilter] = useState<TagFilter>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(() => {
    return Promise.all([
      mistakeNotesApi.listActiveV1MistakeNotesGet(),
      mistakeNotesApi.listMasteredV1MistakeNotesMasteredGet(),
    ])
      .then(([active, mastered]) => {
        setError("");
        setActiveNotes(active);
        setMasteredNotes(mastered);
      })
      .catch(() => {
        setError("データの取得に失敗しました。再読み込みしてください。");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    // 絞り込みの選択肢が出せないだけなので、失敗しても一覧はそのまま使える
    subjectsApi
      .listSubjectsV1SubjectsGet()
      .then(setSubjects)
      .catch(() => {});
  }, []);

  // タブごとに付いているタグが違うので、切り替えたら絞り込みは解除する
  function handleChangeTab(next: MistakeTab) {
    setTab(next);
    setTagFilter(null);
  }

  // 科目の絞り込みは両タブにかけ、タブの件数も絞り込み後の数にする。
  // 科目を空にしたいとき、克服済み側にも残っているかが見えるように。
  const inSubject = (note: MistakeNoteResponse) =>
    subjectFilter === null || note.question.subject.id === subjectFilter;
  const subjectActive = activeNotes.filter(inSubject);
  const subjectMastered = masteredNotes.filter(inSubject);
  const tabNotes = tab === "active" ? subjectActive : subjectMastered;
  const hasAnyNote = activeNotes.length + masteredNotes.length > 0;
  const editHref = (note: MistakeNoteResponse) =>
    `/questions/${note.question.id}/edit` +
    (subjectFilter ? `?subject=${encodeURIComponent(subjectFilter)}` : "");
  const notes = tabNotes.filter((note) => matchesTagFilter(note, tagFilter));

  return (
    <>
      <PageHeader title="苦手問題">
        <MistakeTabs
          tab={tab}
          onChange={handleChangeTab}
          activeCount={subjectActive.length}
          masteredCount={subjectMastered.length}
        />
      </PageHeader>

      <div className="p-5 sm:p-9 max-w-[1000px]">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-md border border-red bg-red-lt px-4 py-3 text-[13px] text-red"
          >
            {error}
          </div>
        )}

        {loading ? (
          // Skeleton mirrors the row layout so content doesn't jump when it loads
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">読み込み中</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse h-20 rounded-md bg-ink-lt/70"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : (
          <>
            {(hasAnyNote || subjectFilter !== null) && subjects.length > 0 && (
              <div className="mb-4">
                <SubjectFilterSelect
                  subjects={subjects}
                  value={subjectFilter}
                  onChange={(next) => {
                    setSubjectFilter(next);
                    setTagFilter(null);
                  }}
                />
              </div>
            )}

            {tabNotes.length === 0 ? (
              subjectFilter === null ? (
                <MistakesEmptyState
                  variant={tab === "active" ? "no-active" : "no-mastered"}
                />
              ) : subjectActive.length + subjectMastered.length === 0 ? (
                <div className="px-3 py-8 text-center text-[13px] text-muted">
                  <p>この科目の問題はありません。</p>
                  <Link
                    href="/subjects"
                    className="mt-2 inline-block text-primary underline"
                  >
                    科目・単元管理へ
                  </Link>
                </div>
              ) : (
                <p className="px-3 py-8 text-center text-[13px] text-muted">
                  この科目の{tab === "active" ? "苦手中" : "克服済み"}の問題はありません。
                </p>
              )
            ) : (
              <div id="mistake-list" role="tabpanel">
                <div className="mb-4">
                  <TagFilterChips
                    notes={tabNotes}
                    filter={tagFilter}
                    onChange={setTagFilter}
                  />
                </div>

                {/* Column header: desktop only, aligned with the rows */}
                <div
                  className={[
                    "hidden px-3 pb-2.5 border-b border-border",
                    ROW_GRID,
                    "sm:items-end text-[11px] font-bold text-muted tracking-[0.07em] uppercase",
                  ].join(" ")}
                >
                  <div>問題</div>
                  <div>間違い</div>
                  <div>{tab === "active" ? "次の復習日" : "状態"}</div>
                  <div />
                </div>

                {notes.length === 0 && (
                  <p className="px-3 py-8 text-center text-[13px] text-muted">
                    この種類の問題はありません。
                  </p>
                )}

                {notes.map((note) => (
                  <MistakeRow
                    key={note.id}
                    note={note}
                    variant={tab}
                    editHref={editHref(note)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
