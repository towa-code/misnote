"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InsightList from "@/components/stats/insight-list";
import TagShareBars from "@/components/stats/tag-share-bars";
import PageHeader from "@/components/layout/page-header";
import type { ReasonTagStatsRow } from "@/generated";
import { statsApi } from "@/lib/api";
import {
  aggregate,
  buildInsights,
  MIN_TAGGED_NOTES,
} from "@/lib/reason-tag-insights";

export default function StatsContent() {
  const [rows, setRows] = useState<ReasonTagStatsRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    statsApi
      .getReasonTagStatsV1StatsReasonTagsGet()
      .then((res) => setRows(res.rows))
      .catch(() => setError("データの取得に失敗しました。再読み込みしてください。"));
  }, []);

  const view = rows ? aggregate(rows) : null;
  const insights = view ? buildInsights(view) : [];

  return (
    <div>
      <PageHeader title="分析" />

      <div className="max-w-[800px] p-5 sm:p-9">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-md border border-red bg-red-lt px-4 py-3 text-[13px] text-red"
          >
            {error}
          </div>
        )}

        {!view && !error && (
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">読み込み中</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-md bg-ink-lt/70"
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {view && view.total === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="mb-2 font-serif text-[18px] font-bold text-ink">
              まだ分析できる問題がありません
            </h2>
            <p className="max-w-xs text-[14px] leading-relaxed text-muted">
              問題を登録するときに「間違いの種類」を選ぶと、ここで間違い方の傾向が見られます。
            </p>
            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-primary-dk"
            >
              問題を登録
            </Link>
          </div>
        )}

        {view && view.total > 0 && (
          <div className="space-y-9">
            <section>
              <h2 className="mb-3 font-serif text-[16px] font-bold text-ink">あなたの間違いの傾向</h2>
              {insights.length > 0 ? (
                <InsightList insights={insights} />
              ) : (
                <p className="rounded-md border border-border bg-surface px-4 py-3.5 text-[13px] text-muted">
                  間違いの種類が付いた問題が{MIN_TAGGED_NOTES}件たまると、ここに分析が表示されます（いま
                  {view.total}件）。
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-3 font-serif text-[16px] font-bold text-ink">
                教科ごとの間違いの種類
              </h2>
              <div className="rounded-md border border-border bg-surface p-4 shadow-sm sm:p-5">
                <TagShareBars view={view} />
              </div>
            </section>
          </div>
        )}

        {view && view.untagged > 0 && (
          <p className="mt-6 text-[12px] text-muted">
            間違いの種類が未分類の問題が{view.untagged}件あります（集計に含まれていません）。
            <Link href="/mistakes?tag=untagged" className="ml-1 text-primary underline">
              タグを付ける →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
