"use client";

import { useState } from "react";
import { REASON_TAGS, reasonTagLabel, type ReasonTag } from "@/lib/reason-tags";
import type { ReasonTagStatsView } from "@/lib/reason-tag-insights";

// タグごとの固定色。色はタグについていくもので、件数の順位では変えない。
// 5色は dataviz の検証スクリプトで色覚多様性の判別を確認済み。「その他」は灰色に寄せる。
// 白地とのコントラストが 3:1 を切る色があるので、数値は色に頼らず文字（読み上げ・表）でも出す。
const TAG_COLORS: Record<ReasonTag, string> = {
  misread: "#2a78d6",
  approach: "#eb6834",
  knowledge: "#1baf7a",
  calculation: "#eda100",
  time: "#e87ba4",
  other: "#9aa5b4",
};

type Row = { key: string; name: string; total: number; counts: Record<ReasonTag, number> };

const pct = (part: number, whole: number) => Math.round((part / whole) * 100);

/** 教科ごとの100%積み上げ横棒。一番上に全体を置き、教科間で割合の違いを見比べる。 */
export default function TagShareBars({ view }: { view: ReasonTagStatsView }) {
  const [hovered, setHovered] = useState<{ row: string; tag: ReasonTag } | null>(null);

  // 全体で多い順に並べ、その順を全部の棒・凡例・表で共有する。教科ごとに並べ替えると
  // 同じタグが棒ごとに違う位置に来て、教科間で見比べられなくなるため。
  // 同数は REASON_TAGS の並び（解く過程の順）。「その他」は中身が分からないので常に右端。
  const tags = [
    ...REASON_TAGS.filter((t) => t.value !== "other").sort(
      (a, b) => view.overall[b.value] - view.overall[a.value]
    ),
    ...REASON_TAGS.filter((t) => t.value === "other"),
  ];

  const rows: Row[] = [
    { key: "all", name: "全体", total: view.total, counts: view.overall },
    ...view.subjects.map((s) => ({ key: s.id, name: s.name, total: s.total, counts: s.counts })),
  ];

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5" aria-label="凡例">
        {tags.map((t) => (
          <li key={t.value} className="flex items-center gap-1.5 text-[12px] text-muted">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TAG_COLORS[t.value] }}
            />
            {t.label}
          </li>
        ))}
      </ul>

      <div className="space-y-4">
        {rows.map((row) => {
          const active = hovered?.row === row.key ? hovered.tag : null;
          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                <span className={row.key === "all" ? "font-bold text-text" : "text-text"}>
                  {row.name}
                </span>
                <span className="text-[12px] text-muted">
                  {active
                    ? `${reasonTagLabel(active)} ${row.counts[active]}件（${pct(row.counts[active], row.total)}%）`
                    : `${row.total}件`}
                </span>
              </div>
              <div className="flex h-3.5 gap-[2px] overflow-hidden rounded bg-surface">
                {tags.filter((t) => row.counts[t.value] > 0).map((t) => {
                  const count = row.counts[t.value];
                  const text = `${row.name}：${t.label} ${count}件（${pct(count, row.total)}%）`;
                  return (
                    <div
                      key={t.value}
                      tabIndex={0}
                      role="img"
                      aria-label={text}
                      title={text}
                      onMouseEnter={() => setHovered({ row: row.key, tag: t.value })}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered({ row: row.key, tag: t.value })}
                      onBlur={() => setHovered(null)}
                      className={[
                        "h-full transition-opacity duration-150",
                        active && active !== t.value ? "opacity-40" : "",
                      ].join(" ")}
                      style={{ width: `${(count / row.total) * 100}%`, backgroundColor: TAG_COLORS[t.value] }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <details className="mt-5 text-[12px]">
        <summary className="cursor-pointer text-primary">表で見る</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-1.5 pr-3 font-bold">教科</th>
                {tags.map((t) => (
                  <th key={t.value} className="px-2 py-1.5 font-bold whitespace-nowrap">
                    {t.label}
                  </th>
                ))}
                <th className="px-2 py-1.5 font-bold">計</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border/60">
                  <th className="py-1.5 pr-3 font-normal whitespace-nowrap text-text">{row.name}</th>
                  {tags.map((t) => (
                    <td key={t.value} className="px-2 py-1.5 whitespace-nowrap text-text">
                      {row.counts[t.value]}
                      <span className="text-muted">（{pct(row.counts[t.value], row.total)}%）</span>
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-text">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
