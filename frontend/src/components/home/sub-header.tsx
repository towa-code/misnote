type Props = {
  label: string;
  count: number;
};

// Subordinate section header: hairline rule, clearly lighter than the
// navy-underlined main section header ("復習リスト")
export default function SubHeader({ label, count }: Props) {
  return (
    <div className="flex items-baseline gap-2.5 mt-10 mb-2 pb-2 border-b border-border">
      <span className="text-[12px] font-bold text-muted tracking-[0.08em]">
        {label}
      </span>
      <span className="text-[12px] text-muted">{count}問</span>
    </div>
  );
}
