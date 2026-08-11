import { reasonTagLabel, type ReasonTag } from "@/lib/reason-tags";

/** 一覧の行に出す原因タグの表示専用バッジ。 */
export default function TagBadge({ tag }: { tag: ReasonTag }) {
  return (
    <span className="inline-flex items-center rounded bg-ink-lt px-1.5 py-px text-[10px] font-bold tracking-[0.04em] text-ink-md normal-case">
      {reasonTagLabel(tag)}
    </span>
  );
}
