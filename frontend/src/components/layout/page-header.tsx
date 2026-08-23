import Link from "next/link";
import type { ReactNode } from "react";

function ChevronLeftIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

type Props = {
  title: string;
  /** 渡すと左端に戻るボタンを出す（戻り先の href） */
  back?: string;
  /** 右端に置くボタン */
  action?: ReactNode;
  /** タイトル行の下に続く付随ブロック（日付・タブなど） */
  children?: ReactNode;
};

/**
 * 全画面共通のページヘッダー。
 *
 * タイトル行は h-16（64px）で高さを固定する。縦パディングではなく高さを直接
 * 指定しているのは、戻るボタンやアクションボタンの有無で高さが動かないようにするため。
 * 画面を行き来したときにヘッダーの下端が上下すると、直下のコンテンツの開始位置が
 * 毎回ずれる。付随要素は行の中ではなく children に渡して、行の下に積む。
 */
export default function PageHeader({ title, back, action, children }: Props) {
  return (
    <header className="bg-surface border-b border-border">
      <div className="h-16 px-5 sm:px-9 flex items-center gap-2">
        {back && (
          <Link
            href={back}
            className="flex items-center justify-center text-primary rounded-md p-2.5 -ml-2.5 transition-colors hover:bg-primary-lt"
            aria-label="戻る"
          >
            <ChevronLeftIcon />
          </Link>
        )}
        <h1 className="font-serif text-[20px] font-bold tracking-[0.02em] text-text">
          {title}
        </h1>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children && <div className="px-5 sm:px-9 pb-3.5">{children}</div>}
    </header>
  );
}
