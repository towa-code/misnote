import Link from "next/link";

type Props = {
  variant: "no-active" | "no-mastered";
};

export default function MistakesEmptyState({ variant }: Props) {
  const content = {
    "no-active": {
      emoji: "🌱",
      title: "苦手問題はありません",
      description: "間違えた問題を登録すると、ここに一覧が表示されます。",
      cta: true,
    },
    "no-mastered": {
      emoji: "💪",
      title: "克服済みの問題はまだありません",
      description: "復習を続けよう。克服済みにした問題がここに集まります。",
      cta: false,
    },
  }[variant];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-5" role="img" aria-label="">
        {content.emoji}
      </span>
      <h2 className="font-serif text-[18px] font-bold text-ink mb-2">
        {content.title}
      </h2>
      <p className="text-[14px] text-muted max-w-xs leading-relaxed">
        {content.description}
      </p>
      {content.cta && (
        <Link
          href="/register"
          className="mt-7 inline-flex items-center gap-2 bg-primary text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-primary-dk transition-colors duration-150"
        >
          問題を登録する
        </Link>
      )}
    </div>
  );
}
