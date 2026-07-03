import HomePageHeader from "@/components/home/page-header";
import SummaryCards from "@/components/home/summary-cards";
import ReviewList from "@/components/home/review-list";
import EmptyState from "@/components/home/empty-state";
import { type ReviewItemData } from "@/components/home/review-item";

// Mock data — replace with API call later
// Test each state by adjusting MOCK_TODAY_ITEMS and MOCK_FUTURE_ITEMS:
//   今日＋明日以降あり: both non-empty
//   今日0件・明日以降あり: MOCK_TODAY_ITEMS=[]  MOCK_FUTURE_ITEMS=[...items]
//   今日も明日以降も0件: both []  MOCK_ACTIVE_COUNT > 0
//   ノートなし: both []  MOCK_ACTIVE_COUNT = 0
const MOCK_TODAY_ITEMS: ReviewItemData[] = [
  {
    id: "1",
    subjectName: "理科",
    questionBody: "光の屈折の法則（スネルの法則）を式で書け",
    wrongCount: 2,
    nextReviewAt: "2026-07-01",
    overdueDays: 2,
  },
];

const MOCK_FUTURE_ITEMS: ReviewItemData[] = [
  {
    id: "2",
    subjectName: "数学",
    unitName: "二次方程式",
    questionBody: "次の方程式を解け：2x² − 5x + 3 = 0",
    wrongCount: 3,
    nextReviewAt: "2026-07-04",
    overdueDays: 0,
  },
  {
    id: "3",
    subjectName: "英語",
    unitName: "文法",
    questionBody: "現在完了形と過去形の違いを説明せよ",
    wrongCount: 1,
    nextReviewAt: "2026-07-10",
    overdueDays: 0,
  },
];

const MOCK_ACTIVE_COUNT = 12;

export default function HomePage() {
  const hasToday = MOCK_TODAY_ITEMS.length > 0;
  const hasFuture = MOCK_FUTURE_ITEMS.length > 0;
  const hasAnyNotes = MOCK_ACTIVE_COUNT > 0;

  // Show ReviewList when there's anything to display (today or future)
  const showList = hasToday || hasFuture;

  return (
    <>
      <HomePageHeader />
      <div className="p-9 max-w-[1000px]">
        <SummaryCards
          todayCount={MOCK_TODAY_ITEMS.length}
          activeCount={MOCK_ACTIVE_COUNT}
          masteredCount={8}
        />

        {/* done-today message appears when today is empty but future exists, or all done */}
        {!hasToday && hasAnyNotes && (
          <EmptyState variant="done-today" />
        )}

        {/* No notes at all */}
        {!hasAnyNotes && (
          <EmptyState variant="no-notes" />
        )}

        {/* List: today + future (future-only is also shown after done-today message) */}
        {showList && (
          <ReviewList
            todayItems={MOCK_TODAY_ITEMS}
            futureItems={MOCK_FUTURE_ITEMS}
          />
        )}
      </div>
    </>
  );
}
