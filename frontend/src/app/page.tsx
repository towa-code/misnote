import HomePageHeader from "@/components/home/page-header";
import SummaryCards from "@/components/home/summary-cards";
import ReviewList from "@/components/home/review-list";
import EmptyState from "@/components/home/empty-state";
import { type ReviewItemData } from "@/components/home/review-item";

// Mock data — replace with API call later
// Switch between [], [DONE], or full list to test each state
const MOCK_ITEMS: ReviewItemData[] = [
  {
    id: "1",
    subjectName: "理科",
    questionBody: "光の屈折の法則（スネルの法則）を式で書け",
    wrongCount: 2,
    nextReviewAt: "2026-07-01",
    overdueDays: 2,
  },
  {
    id: "2",
    subjectName: "数学",
    unitName: "二次方程式",
    questionBody: "次の方程式を解け：2x² − 5x + 3 = 0",
    wrongCount: 3,
    nextReviewAt: new Date().toISOString(),
    overdueDays: 0,
  },
  {
    id: "3",
    subjectName: "英語",
    unitName: "文法",
    questionBody: "現在完了形と過去形の違いを説明せよ",
    wrongCount: 1,
    nextReviewAt: new Date().toISOString(),
    overdueDays: 0,
  },
];

const MOCK_ACTIVE_COUNT = 12; // total active notes (including unscheduled)

export default function HomePage() {
  const todayItems = MOCK_ITEMS;
  const hasAnyNotes = MOCK_ACTIVE_COUNT > 0;

  return (
    <>
      <HomePageHeader />
      <div className="p-9 max-w-[1000px]">
        <SummaryCards
          todayCount={todayItems.length}
          activeCount={MOCK_ACTIVE_COUNT}
          masteredCount={8}
        />

        {todayItems.length > 0 ? (
          <ReviewList items={todayItems} />
        ) : hasAnyNotes ? (
          <EmptyState variant="done-today" />
        ) : (
          <EmptyState variant="no-notes" />
        )}
      </div>
    </>
  );
}
