"use client";

type Props = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/** 復習日を日付欄に入れるチップ。保存はしない（既存の保存ボタンに任せる）。 */
export default function DateChip({ label, selected, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-[12px] transition-colors duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        selected
          ? "border-primary bg-primary font-bold text-white"
          : "border-border bg-surface text-muted hover:border-line hover:bg-ink-lt hover:text-ink",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
