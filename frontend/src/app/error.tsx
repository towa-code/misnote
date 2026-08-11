"use client";

import Link from "next/link";

// error.tsx は同じ階層の layout.tsx を包まないので、ここが出ている間も
// AppShell（サイドバー・ボトムナビ）はそのまま使える。
export default function AppError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
      <span className="text-5xl mb-5" role="img" aria-label="">
        ⚠️
      </span>
      <h2 className="font-serif text-[18px] font-bold text-ink mb-2">
        画面の表示中に問題が起きました
      </h2>
      <p className="text-[14px] text-muted max-w-xs leading-relaxed mb-7">
        記録したノートは残っています。もう一度読み込んでみてください。
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex items-center gap-2 bg-primary text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-primary-dk transition-colors duration-150"
        >
          もう一度読み込む
        </button>
        <Link
          href="/"
          className="bg-surface text-muted border border-border rounded-md px-5 py-3 text-[14px] transition-colors hover:bg-ink-lt hover:border-line hover:text-text"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  );
}
