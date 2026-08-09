import Link from "next/link";
import type { DraftResponse } from "@/generated";

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// 例：8月9日 17:40
function formatSavedAt(value: Date): string {
  return value.toLocaleString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  draft: DraftResponse;
  onDelete: (draft: DraftResponse) => void;
};

export default function DraftRow({ draft, onDelete }: Props) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-text">
          {draft.body}
        </p>
        <p className="mt-1.5 text-[11px] text-muted">
          {formatSavedAt(draft.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/register?draft=${draft.id}`}
          className="rounded-md bg-primary px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-primary-dk"
        >
          登録する
        </Link>
        <button
          type="button"
          aria-label="この下書きを削除"
          onClick={() => onDelete(draft)}
          className="rounded-md p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
