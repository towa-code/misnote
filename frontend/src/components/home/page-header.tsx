import Link from "next/link";

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function HomePageHeader() {
  const today = formatDate(new Date());

  return (
    <header className="bg-surface border-b border-border px-9 py-5 flex justify-between items-center">
      <div>
        <h1 className="font-serif text-[26px] font-bold tracking-[0.02em] text-text">
          今日の復習
        </h1>
        <p className="text-[14px] text-muted mt-1 tracking-[0.02em]">{today}</p>
      </div>

      <Link
        href="/register"
        className="flex items-center gap-2 bg-amber text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-amber-dk transition-colors duration-150"
      >
        <PlusIcon />
        問題を登録
      </Link>
    </header>
  );
}
