type Props = {
  onStart: () => void;
};

export default function QuickEmptyState({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="mb-5 text-5xl" role="img" aria-label="">
        ✏️
      </span>
      <h2 className="mb-2 font-serif text-[18px] font-bold text-navy">
        下書きはありません
      </h2>
      <p className="max-w-xs text-[14px] leading-relaxed text-muted">
        間違えた問題を問題文だけで書き留めておけます。科目や理由はあとから付けられます。
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-7 inline-flex items-center gap-2 rounded-md bg-amber px-6 py-3 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-amber-dk"
      >
        書き留める
      </button>
    </div>
  );
}
