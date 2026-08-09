"use client";

import { useEffect, useState } from "react";
import type { DraftResponse } from "@/generated";
import DraftRow from "@/components/quick/draft-row";
import QuickEmptyState from "@/components/quick/empty-state";
import QuickSaveModal from "@/components/quick/quick-save-modal";
import { draftsApi } from "@/lib/api";

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

export default function QuickContent() {
  const [drafts, setDrafts] = useState<DraftResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    draftsApi
      .listDraftsV1DraftsGet()
      .then(setDrafts)
      .catch(() => setError("下書きの取得に失敗しました。再読み込みしてください。"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(draft: DraftResponse) {
    if (!window.confirm("この下書きを削除しますか？")) return;
    try {
      await draftsApi.deleteDraftV1DraftsDraftIdDelete({ draftId: draft.id });
      setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    } catch {
      setError("下書きの削除に失敗しました。");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-5 py-[18px] sm:px-9">
        <h1 className="font-serif text-[20px] font-bold tracking-[0.02em]">
          クイック保存
        </h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[13px] font-bold text-white transition-colors duration-150 hover:bg-primary-dk"
        >
          <PlusIcon />
          書き留める
        </button>
      </div>

      <div className="max-w-[800px] p-5 sm:p-9">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && drafts.length === 0 && (
          <QuickEmptyState onStart={() => setModalOpen(true)} />
        )}

        {drafts.length > 0 && (
          <div className="overflow-hidden rounded-md border border-border bg-white shadow-sm">
            {drafts.map((draft) => (
              <DraftRow key={draft.id} draft={draft} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <QuickSaveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(draft) => setDrafts((prev) => [draft, ...prev])}
      />
    </div>
  );
}
