import ReviewItem, { type ReviewItemData } from "@/components/home/review-item";

type Props = {
  items: ReviewItemData[];
};

export default function ReviewList({ items }: Props) {
  return (
    <section className="mt-8">
      <div className="flex items-baseline gap-3 pb-2.5 mb-4 border-b-2 border-navy">
        <h2 className="font-serif text-[16px] font-bold tracking-[0.04em]">復習リスト</h2>
        <span className="text-[13px] text-muted">{items.length}問</span>
      </div>

      <div>
        {items.map((item) => (
          <ReviewItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
