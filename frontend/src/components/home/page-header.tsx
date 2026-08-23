import Link from "next/link";
import PageHeader from "@/components/layout/page-header";

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
    <PageHeader
      title="今日の復習"
      action={
        <Link
          href="/register"
          className="flex items-center gap-2 bg-primary text-white rounded-md px-5 py-2.5 text-[13px] font-bold hover:bg-primary-dk transition-colors duration-150"
        >
          <PlusIcon />
          問題を登録
        </Link>
      }
    >
      <p className="text-[14px] text-muted tracking-[0.02em]">{today}</p>
    </PageHeader>
  );
}
