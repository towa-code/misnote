"use client";

import type { MistakeNoteResponse } from "@/generated";
import { REASON_TAGS, type ReasonTag } from "@/lib/reason-tags";

/** 未分類（reason_tag が null）を表す絞り込みの値。 */
export const UNTAGGED = "untagged";

export type TagFilter = ReasonTag | typeof UNTAGGED | null;

export function matchesTagFilter(
  note: MistakeNoteResponse,
  filter: TagFilter
): boolean {
  if (filter === null) return true;
  if (filter === UNTAGGED) return note.reasonTag === null;
  return note.reasonTag === filter;
}

type Props = {
  notes: MistakeNoteResponse[];
  filter: TagFilter;
  onChange: (next: TagFilter) => void;
};

/**
 * タグ別の件数チップ。表示中の一覧を数えるだけなので集計 API は使わない。
 * 件数が 0 のタグは出さない（選んでも空になるだけなので）。
 */
export default function TagFilterChips({ notes, filter, onChange }: Props) {
  const counts = new Map<ReasonTag | typeof UNTAGGED, number>();
  for (const note of notes) {
    const key = note.reasonTag ?? UNTAGGED;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const chips: { value: TagFilter; label: string; count: number }[] = [
    { value: null, label: "すべて", count: notes.length },
    ...REASON_TAGS.filter((tag) => counts.has(tag.value)).map((tag) => ({
      value: tag.value as TagFilter,
      label: tag.label,
      count: counts.get(tag.value) ?? 0,
    })),
  ];
  if (counts.has(UNTAGGED)) {
    chips.push({
      value: UNTAGGED,
      label: "未分類",
      count: counts.get(UNTAGGED) ?? 0,
    });
  }

  // タグが1つも付いていないうちは「すべて」と「未分類」しか出ず、選ぶ意味がない
  if (chips.length <= 2) return null;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="間違いの種類で絞り込む"
    >
      {chips.map((chip) => {
        const selected = filter === chip.value;
        return (
          <button
            key={chip.value ?? "all"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : chip.value)}
            className={[
              "rounded-full border px-3 py-1 text-[12px] transition-colors duration-150",
              selected
                ? "border-primary bg-primary font-bold text-white"
                : "border-border bg-surface text-muted hover:border-line hover:bg-ink-lt hover:text-ink",
            ].join(" ")}
          >
            {chip.label}
            <span className={selected ? "ml-1.5" : "ml-1.5 opacity-60"}>
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
