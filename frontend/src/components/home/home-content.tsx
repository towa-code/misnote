"use client";

import { useCallback, useEffect, useState } from "react";
import SummaryCards from "@/components/home/summary-cards";
import ReviewList from "@/components/home/review-list";
import EmptyState from "@/components/home/empty-state";
import { type ReviewItemData } from "@/components/home/review-item";
import type { MistakeNoteResponse } from "@/generated";
import { mistakeNotesApi } from "@/lib/api";

function toReviewItem(note: MistakeNoteResponse): ReviewItemData {
  const nextReviewAt = note.nextReviewAt
    ? note.nextReviewAt.toISOString().slice(0, 10)
    : null;

  let overdueDays = 0;
  if (nextReviewAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDate = new Date(nextReviewAt);
    reviewDate.setHours(0, 0, 0, 0);
    overdueDays = Math.max(
      0,
      Math.round((today.getTime() - reviewDate.getTime()) / 86_400_000)
    );
  }

  return {
    id: note.id,
    subjectName: note.question.subject.name,
    unitName: note.question.unit?.name,
    questionBody: note.question.questionText,
    wrongCount: note.wrongCount,
    nextReviewAt,
    overdueDays,
  };
}

export default function HomeContent() {
  const [todayItems, setTodayItems] = useState<ReviewItemData[]>([]);
  const [futureItems, setFutureItems] = useState<ReviewItemData[]>([]);
  const [unscheduledItems, setUnscheduledItems] = useState<ReviewItemData[]>(
    []
  );
  const [activeCount, setActiveCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(() => {
    return Promise.all([
      mistakeNotesApi.listTodayV1MistakeNotesTodayGet(),
      mistakeNotesApi.listActiveV1MistakeNotesGet(),
      mistakeNotesApi.listMasteredV1MistakeNotesMasteredGet(),
    ])
      .then(([todayNotes, activeNotes, masteredNotes]) => {
        const todayIds = new Set(todayNotes.map((n) => n.id));
        const future: MistakeNoteResponse[] = [];
        const unscheduled: MistakeNoteResponse[] = [];
        for (const note of activeNotes) {
          if (todayIds.has(note.id)) continue;
          if (note.nextReviewAt === null) {
            unscheduled.push(note);
          } else {
            future.push(note);
          }
        }

        setError("");
        setTodayItems(todayNotes.map(toReviewItem));
        setFutureItems(future.map(toReviewItem));
        setUnscheduledItems(unscheduled.map(toReviewItem));
        setActiveCount(activeNotes.length);
        setMasteredCount(masteredNotes.length);
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

  if (loading) {
    return (
      <div className="p-9 max-w-[1000px] text-[14px] text-muted">
        読み込み中…
      </div>
    );
  }

  const hasToday = todayItems.length > 0;
  const hasAnyNotes = activeCount > 0;
  const showList =
    hasToday || futureItems.length > 0 || unscheduledItems.length > 0;

  return (
    <div className="p-9 max-w-[1000px]">
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <SummaryCards
        todayCount={todayItems.length}
        activeCount={activeCount}
        masteredCount={masteredCount}
      />

      {/* Today's reviews are all done (but notes exist) */}
      {!hasToday && hasAnyNotes && <EmptyState variant="done-today" />}

      {/* No notes at all */}
      {!hasAnyNotes && <EmptyState variant="no-notes" />}

      {/* Today + upcoming + unscheduled in one list */}
      {showList && (
        <ReviewList
          todayItems={todayItems}
          futureItems={futureItems}
          unscheduledItems={unscheduledItems}
        />
      )}
    </div>
  );
}
