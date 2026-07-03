import HomePageHeader from "@/components/home/page-header";
import SummaryCards from "@/components/home/summary-cards";
import ReviewList from "@/components/home/review-list";
import EmptyState from "@/components/home/empty-state";
import { type ReviewItemData } from "@/components/home/review-item";

// Mock data — replace with API call later
// Test each state by adjusting the mock arrays:
//   通常表示:            all non-empty
//   今日0件・予定あり:    MOCK_TODAY_ITEMS = []
//   全部0件（ノートあり）: all []  MOCK_ACTIVE_COUNT > 0
//   ノートなし:          all []  MOCK_ACTIVE_COUNT = 0
const MOCK_TODAY_ITEMS: ReviewItemData[] = [
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
];

const MOCK_FUTURE_ITEMS: ReviewItemData[] = [
  {
    id: "3",
    subjectName: "英語",
    unitName: "文法",
    questionBody: "現在完了形と過去形の違いを説明せよ",
    wrongCount: 1,
    nextReviewAt: "2026-07-04",
    overdueDays: 0,
  },
  {
    id: "4",
    subjectName: "国語",
    unitName: "古文",
    questionBody: "係り結びの法則を例文とともに説明せよ",
    wrongCount: 2,
    nextReviewAt: "2026-07-10",
    overdueDays: 0,
  },
];

const MOCK_UNSCHEDULED_ITEMS: ReviewItemData[] = [
  {
    id: "5",
    subjectName: "社会",
    unitName: "歴史",
    questionBody: "鎌倉幕府の成立年とその根拠を説明せよ",
    wrongCount: 1,
    nextReviewAt: null,
    overdueDays: 0,
  },
];

const MOCK_ACTIVE_COUNT = 12;

export default function HomePage() {
  const hasToday = MOCK_TODAY_ITEMS.length > 0;
  const hasAnyNotes = MOCK_ACTIVE_COUNT > 0;
  const showList =
    hasToday ||
    MOCK_FUTURE_ITEMS.length > 0 ||
    MOCK_UNSCHEDULED_ITEMS.length > 0;

  return (
    <>
      <HomePageHeader />
      <div className="p-9 max-w-[1000px]">
        <SummaryCards
          todayCount={MOCK_TODAY_ITEMS.length}
          activeCount={MOCK_ACTIVE_COUNT}
          masteredCount={8}
        />

        {/* Today's reviews are all done (but notes exist) */}
        {!hasToday && hasAnyNotes && <EmptyState variant="done-today" />}

        {/* No notes at all */}
        {!hasAnyNotes && <EmptyState variant="no-notes" />}

        {/* Today + upcoming + unscheduled in one list */}
        {showList && (
          <ReviewList
            todayItems={MOCK_TODAY_ITEMS}
            futureItems={MOCK_FUTURE_ITEMS}
            unscheduledItems={MOCK_UNSCHEDULED_ITEMS}
          />
        )}
      </div>
    </>
  );
}
