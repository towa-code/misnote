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
    // Skeleton mirrors the real layout so content doesn't jump when it loads
    return (
      <div className="p-5 sm:p-9 max-w-[1000px]" aria-busy="true">
        <span className="sr-only">読み込み中</span>
        <div
          className="flex gap-px bg-border border border-border rounded-lg overflow-hidden shadow-sm"
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 bg-surface px-6 py-[18px]">
              <div className="animate-pulse space-y-2.5">
                <div className="h-3 w-14 rounded bg-navy-lt" />
                <div className="h-8 w-10 rounded bg-navy-lt" />
                <div className="h-3 w-20 rounded bg-navy-lt" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-9 space-y-4" aria-hidden="true">
          <div className="animate-pulse h-5 w-32 rounded bg-navy-lt" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse h-16 rounded-md bg-navy-lt/70" />
          ))}
        </div>
      </div>
    );
  }

  const hasToday = todayItems.length > 0;
  const hasAnyNotes = activeCount > 0;
  const showList =
    hasToday || futureItems.length > 0 || unscheduledItems.length > 0;

  return (
    <div className="p-5 sm:p-9 max-w-[1000px]">
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
        >
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
