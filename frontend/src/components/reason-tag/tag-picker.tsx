"use client";

import { REASON_TAGS, type ReasonTag } from "@/lib/reason-tags";

type Props = {
  value: ReasonTag | null;
  onChange: (next: ReasonTag | null) => void;
  disabled?: boolean;
};

/** 原因タグの選択チップ。選択済みをもう一度押すと解除される。 */
export default function TagPicker({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="間違いの種類">
      {REASON_TAGS.map((tag) => {
        const selected = value === tag.value;
        return (
          <button
            key={tag.value}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : tag.value)}
            className={[
              "rounded-full border px-3 py-1.5 text-[12px] transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              selected
                ? "border-navy bg-navy font-bold text-white"
                : "border-border bg-surface text-muted hover:border-[#CBD5E1] hover:bg-navy-lt hover:text-navy",
            ].join(" ")}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}
