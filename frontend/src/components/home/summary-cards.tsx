type StatCardProps = {
  label: string;
  value: number;
  sub: string;
  accent?: "green";
};

function StatCard({ label, value, sub, accent }: StatCardProps) {
  // 青＝未克服、緑＝克服済み。Today は苦手問題の部分集合なので同じ青を持つ
  const valueColor = accent === "green" ? "text-green" : "text-primary";

  return (
    <div className="flex-1 bg-surface px-3.5 py-[18px] sm:px-6">
      <p className="text-[11px] text-muted font-bold tracking-[0.08em] uppercase mb-1.5">
        {label}
      </p>
      <p className={`font-serif text-[32px] font-bold leading-none tabular-nums ${valueColor}`}>
        {value}
      </p>
      <p className="text-[12px] text-muted mt-1">{sub}</p>
    </div>
  );
}

type Props = {
  todayCount: number;
  activeCount: number;
  masteredCount: number;
};

export default function SummaryCards({ todayCount, activeCount, masteredCount }: Props) {
  return (
    <div className="flex gap-px bg-border border border-border rounded-lg overflow-hidden shadow-sm">
      <StatCard label="Today" value={todayCount} sub="今日やる問題" />
      <StatCard label="苦手問題" value={activeCount} sub="復習中の問題" />
      <StatCard label="克服済み" value={masteredCount} sub="克服した問題" accent="green" />
    </div>
  );
}
