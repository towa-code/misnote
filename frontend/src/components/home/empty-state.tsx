import Link from "next/link";

type Props = {
  variant: "no-notes" | "done-today";
};

export default function EmptyState({ variant }: Props) {
  const content = {
    "no-notes": {
      emoji: "📝",
      title: "間違えた問題を登録して復習をはじめよう",
      description: "問題を登録すると、ここに今日の復習リストが表示されます。",
    },
    "done-today": {
      emoji: "🎉",
      title: "今日の復習は完了！",
      description: "お疲れさまでした。新しい問題を登録しておきましょう。",
    },
  }[variant];

  return (
    <div className="mt-8 flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-5" role="img" aria-label="">
        {content.emoji}
      </span>
      <h2 className="font-serif text-[18px] font-bold text-navy mb-2">
        {content.title}
      </h2>
      <p className="text-[14px] text-muted mb-7 max-w-xs leading-relaxed">
        {content.description}
      </p>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 bg-amber text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-amber-dk transition-colors duration-150"
      >
        問題を登録する
      </Link>
    </div>
  );
}
