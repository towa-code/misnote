export type MistakeTab = "active" | "mastered";

type Props = {
  tab: MistakeTab;
  onChange: (tab: MistakeTab) => void;
  activeCount: number;
  masteredCount: number;
};

export default function MistakeTabs({
  tab,
  onChange,
  activeCount,
  masteredCount,
}: Props) {
  const tabs: { key: MistakeTab; label: string; count: number }[] = [
    { key: "active", label: "苦手中", count: activeCount },
    { key: "mastered", label: "克服済み", count: masteredCount },
  ];

  return (
    <div role="tablist" aria-label="苦手問題の絞り込み" className="flex">
      {tabs.map(({ key, label, count }) => {
        const selected = key === tab;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="mistake-list"
            onClick={() => onChange(key)}
            className={[
              "px-4 sm:px-5 py-2.5 text-[13px] tracking-[0.02em] border-b-2 transition-colors duration-150",
              selected
                ? "text-navy font-bold border-amber"
                : "text-muted font-medium border-transparent hover:text-navy",
            ].join(" ")}
          >
            {label}
            <span
              className={[
                "inline-block align-middle ml-1.5 px-1.5 py-px rounded-[10px] text-[11px] font-bold",
                selected ? "bg-amber-lt text-amber" : "bg-navy-lt text-muted",
              ].join(" ")}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
