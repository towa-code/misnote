"use client";

import { useEffect, useRef, useState } from "react";
import type { DraftResponse } from "@/generated";
import { draftsApi } from "@/lib/api";
import { inputBase } from "@/lib/form-styles";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (draft: DraftResponse) => void;
};

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function QuickSaveModal({ open, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  // ネイティブの <dialog> に開閉を委ねる。Escape・フォーカストラップ・
  // 背景の inert 化はブラウザ側が面倒を見てくれる。
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape・閉じるボタン・バックドロップのどれで閉じてもここを通る
  function handleDialogClose() {
    setBody("");
    setError("");
    setSavedCount(0);
    onClose();
  }

  async function handleSave() {
    const text = body.trim();
    if (!text) return;

    setSaving(true);
    setError("");
    try {
      const draft = await draftsApi.createDraftV1DraftsPost({
        draftCreate: { body: text },
      });
      onSaved(draft);
      // 続けて何問も打ち込めるよう、モーダルは閉じずに入力欄だけ空にする
      setBody("");
      setSavedCount((count) => count + 1);
    } catch {
      setError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  // m-auto は必須。Tailwind の preflight が全要素に margin:0 を当てるため、
  // <dialog> 既定の margin:auto による中央寄せが潰れて左上に貼り付く。
  return (
    <dialog
      ref={dialogRef}
      onClose={handleDialogClose}
      onClick={(e) => {
        // バックドロップ（<dialog> 自身の余白）のクリックで閉じる
        if (e.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-labelledby="quick-save-title"
      className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-lg border border-border bg-white p-0 text-text shadow-lg backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2
          id="quick-save-title"
          className="font-serif text-[17px] font-bold tracking-[0.02em]"
        >
          クイック保存
        </h2>
        <button
          type="button"
          aria-label="閉じる"
          onClick={() => dialogRef.current?.close()}
          className="rounded-md p-2 -mr-2 text-muted transition-colors hover:bg-ink-lt hover:text-text"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="px-5 py-5">
        <label htmlFor="quick-save-body" className="sr-only">
          問題文
        </label>
        <textarea
          id="quick-save-body"
          autoFocus
          rows={6}
          className={inputBase + " resize-y leading-relaxed"}
          placeholder="間違えた問題をそのまま書いておこう"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={saving}
        />
        <p className="mt-1.5 text-[11px] text-muted">
          科目や理由はあとで整理するときに選びます
        </p>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
          >
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        <p aria-live="polite" className="text-[12px] text-muted">
          {savedCount > 0 && `保存しました（${savedCount}件）`}
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || body.trim() === ""}
          className="rounded-md bg-primary px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-dk disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
    </dialog>
  );
}
