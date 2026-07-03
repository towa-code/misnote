import HomePageHeader from "@/components/home/page-header";
import SummaryCards from "@/components/home/summary-cards";

export default function HomePage() {
  return (
    <>
      <HomePageHeader />
      <div className="p-9 max-w-[1000px]">
        <SummaryCards todayCount={3} activeCount={12} masteredCount={8} />
        <p className="mt-9 text-muted">（復習リスト 準備中）</p>
      </div>
    </>
  );
}
