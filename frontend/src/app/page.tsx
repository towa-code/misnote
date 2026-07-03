import HomePageHeader from "@/components/home/page-header";
import SummaryCards from "@/components/home/summary-cards";
import ReviewList from "@/components/home/review-list";
import { type ReviewItemData } from "@/components/home/review-item";

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

export default function HomePage() {
  return (
    <>
      <HomePageHeader />
      <div className="p-9 max-w-[1000px]">
        <SummaryCards
          todayCount={MOCK_ITEMS.length}
          activeCount={12}
          masteredCount={8}
        />
        <ReviewList
          items={MOCK_ITEMS}
          onItemClick={(id) => console.log("review", id)}
        />
      </div>
    </>
  );
}
