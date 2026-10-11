import Link from "next/link";

// ルートの not-found.tsx は存在しない URL 全体を受け持つ。
// root layout の中で描画されるので、AppShell（サイドバー・ボトムナビ）はそのまま使える。
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-5 text-center">
      <span className="text-5xl mb-5" role="img" aria-label="">
        🔍
      </span>
      <h2 className="font-serif text-[18px] font-bold text-ink mb-2">
        ページが見つかりませんでした
      </h2>
      <p className="text-[14px] text-muted max-w-xs leading-relaxed mb-7">
        URLが間違っているか、ページが移動した可能性があります。
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-primary-dk transition-colors duration-150"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}
