import ReviewItem, { type ReviewItemData } from "@/components/home/review-item";

type Props = {
  items: ReviewItemData[];
  onItemClick: (id: string) => void;
};

export default function ReviewList({ items, onItemClick }: Props) {
  return (
    <section className="mt-8">
      {/* Section header */}
      <div className="flex items-baseline gap-3 pb-2.5 mb-4 border-b-2 border-navy">
        <h2 className="font-serif text-[16px] font-bold tracking-[0.04em]">復習リスト</h2>
        <span className="text-[13px] text-muted">{items.length}問</span>
      </div>

      {/* List */}
      <div>
        {items.map((item) => (
          <ReviewItem key={item.id} item={item} onClick={onItemClick} />
        ))}
      </div>
    </section>
  );
}
