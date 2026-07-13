import ReviewItem, { type ReviewItemData } from "@/components/home/review-item";
import UpcomingItem from "@/components/home/upcoming-item";
import SubHeader from "@/components/home/sub-header";

type Props = {
  todayItems: ReviewItemData[];
  futureItems: ReviewItemData[];
  unscheduledItems: ReviewItemData[];
  onSetReviewDate?: (id: string, date: string) => void;
};

export default function ReviewList({
  todayItems,
  futureItems,
  unscheduledItems,
  onSetReviewDate,
}: Props) {
  return (
    <section className="mt-8">
      {/* Today: main section with navy-underlined header */}
      {todayItems.length > 0 && (
        <>
          <div className="flex items-baseline gap-3 pb-2.5 mb-4 border-b-2 border-navy">
            <h2 className="font-serif text-[16px] font-bold tracking-[0.04em]">復習リスト</h2>
            <span className="text-[13px] text-muted">{todayItems.length}問</span>
          </div>
          <div>
            {todayItems.map((item) => (
              <ReviewItem key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* Upcoming: subordinate, date-led rows */}
      {futureItems.length > 0 && (
        <>
          <SubHeader label="明日以降の予定" count={futureItems.length} />
          <div>
            {futureItems.map((item) => (
              <UpcomingItem key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* Unscheduled: always at the very bottom */}
      {unscheduledItems.length > 0 && (
        <>
          <SubHeader label="復習日未設定" count={unscheduledItems.length} />
          <div>
            {unscheduledItems.map((item) => (
              <UpcomingItem
                key={item.id}
                item={item}
                onSetReviewDate={onSetReviewDate}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
