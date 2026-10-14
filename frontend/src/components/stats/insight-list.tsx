import type { Insight } from "@/lib/reason-tag-insights";

/** 分析文の一覧。どの文も「事実」と「次にどうするか」の2段で見せる。 */
export default function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <ul className="space-y-3">
      {insights.map((insight, i) => (
        <li
          key={i}
          className="rounded-md border border-border bg-surface px-4 py-3.5 shadow-sm"
        >
          <p className="text-[14px] font-bold leading-relaxed text-text">{insight.fact}</p>
          <p className="mt-1.5 flex gap-1.5 text-[13px] leading-relaxed text-muted">
            <span aria-hidden="true" className="text-primary">
              →
            </span>
            {insight.advice}
          </p>
        </li>
      ))}
    </ul>
  );
}
