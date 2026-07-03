import HomePageHeader from "@/components/home/page-header";
import SummaryCards from "@/components/home/summary-cards";
import ReviewList from "@/components/home/review-list";
import EmptyState from "@/components/home/empty-state";
import { type ReviewItemData } from "@/components/home/review-item";

// Mock data — replace with API call later
// To test each state, change the two values below:
//   通常表示:    MOCK_TODAY_ITEMS = [...items]  MOCK_ACTIVE_COUNT = 12
//   done-today: MOCK_TODAY_ITEMS = []           MOCK_ACTIVE_COUNT = 12
//   no-notes:   MOCK_TODAY_ITEMS = []           MOCK_ACTIVE_COUNT = 0
const MOCK_TODAY_ITEMS: ReviewItemData[] = [];

const MOCK_ACTIVE_COUNT = 12; // total active notes

export default function HomePage() {
  const todayItems = MOCK_TODAY_ITEMS;
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
