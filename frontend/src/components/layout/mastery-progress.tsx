"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { statsApi } from "@/lib/api";

type Summary = { mastered: number; total: number };

export default function MasteryProgress() {
  const pathname = usePathname();
  const [summary, setSummary] = useState<Summary | null>(null);

  // サイドバーは AppShell に一度しかマウントされないので、画面遷移のたびに取り直す。
  // これがないと復習画面で克服してもバーが動かない。
  useEffect(() => {
    let cancelled = false;
    statsApi
      .getSummaryV1StatsSummaryGet()
      .then((s) => {
        if (!cancelled) setSummary({ mastered: s.masteredCount, total: s.totalCount });
      })
      // 補助表示なのでエラーは出さない。前回の値のまま黙って据え置く。
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // 読み込みが終わるまで何も出さない。先に 0% のバーを出すと「克服率0」に見えるため。
  if (!summary) return null;

  const percent =
    summary.total === 0 ? 0 : Math.round((summary.mastered / summary.total) * 100);

  return (
    <div className="border-t border-white/10 p-4">
      <div className="mb-2 text-[11px] tracking-[0.08em] text-white/55">克服率</div>
      <div
        role="progressbar"
        aria-label="克服率"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mb-1.5 h-[5px] rounded-full bg-white/12"
      >
        <div
          className="h-[5px] rounded-full bg-amber-br"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-white/60">
        <strong className="text-white/80">{summary.mastered}</strong> 問克服 / 全{" "}
        {summary.total} 問
      </div>
    </div>
  );
}
