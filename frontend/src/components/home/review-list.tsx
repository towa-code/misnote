import ReviewItem, { type ReviewItemData } from "@/components/home/review-item";
import UpcomingDivider from "@/components/home/upcoming-divider";

type Props = {
  todayItems: ReviewItemData[];
  futureItems: ReviewItemData[];
};

export default function ReviewList({ todayItems, futureItems }: Props) {
  const hasFuture = futureItems.length > 0;

  return (
    <section className="mt-8">
      {/* Section header — only when there are today's items */}
      {todayItems.length > 0 && (
        <div className="flex items-baseline gap-3 pb-2.5 mb-4 border-b-2 border-navy">
          <h2 className="font-serif text-[16px] font-bold tracking-[0.04em]">復習リスト</h2>
          <span className="text-[13px] text-muted">{todayItems.length}問</span>
        </div>
      )}

      <div>
        {/* Today's items */}
        {todayItems.map((item) => (
          <ReviewItem key={item.id} item={item} />
        ))}

        {/* Divider + future items */}
        {hasFuture && (
          <>
            <UpcomingDivider />
            {futureItems.map((item) => (
              <ReviewItem key={item.id} item={item} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
