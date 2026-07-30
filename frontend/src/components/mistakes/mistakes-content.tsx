"use client";

import { useCallback, useEffect, useState } from "react";
import MistakeTabs, { type MistakeTab } from "@/components/mistakes/mistake-tabs";
import MistakeRow, { ROW_GRID } from "@/components/mistakes/mistake-row";
import MistakesEmptyState from "@/components/mistakes/empty-state";
import {
  type MistakeNoteResponse,
  MistakeNoteStatusUpdateStatusEnum,
} from "@/generated";
import { mistakeNotesApi } from "@/lib/api";

const STATUS_ENUM = {
  active: MistakeNoteStatusUpdateStatusEnum.Active,
  mastered: MistakeNoteStatusUpdateStatusEnum.Mastered,
};

export default function MistakesContent() {
  const [activeNotes, setActiveNotes] = useState<MistakeNoteResponse[]>([]);
  const [masteredNotes, setMasteredNotes] = useState<MistakeNoteResponse[]>([]);
  const [tab, setTab] = useState<MistakeTab>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    return Promise.all([
      mistakeNotesApi.listActiveV1MistakeNotesGet(),
      mistakeNotesApi.listMasteredV1MistakeNotesMasteredGet(),
    ])
      .then(([active, mastered]) => {
        setError("");
        setActiveNotes(active);
        setMasteredNotes(mastered);
      })
      .catch(() => {
        setError("データの取得に失敗しました。再読み込みしてください。");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleChangeStatus(noteId: string, next: MistakeTab) {
    setBusyId(noteId);
    try {
      await mistakeNotesApi.updateStatusV1MistakeNotesNoteIdStatusPut({
        noteId,
        mistakeNoteStatusUpdate: { status: STATUS_ENUM[next] },
      });
      await loadAll();
    } catch {
      setError("状態の変更に失敗しました。");
    } finally {
      setBusyId(null);
    }
  }

  const notes = tab === "active" ? activeNotes : masteredNotes;

  return (
    <>
      <header className="bg-surface border-b border-border px-5 sm:px-9 pt-5">
        <h1 className="font-serif text-[26px] font-bold tracking-[0.02em] text-text">
          苦手問題
        </h1>
        <div className="mt-3.5">
          <MistakeTabs
            tab={tab}
            onChange={setTab}
            activeCount={activeNotes.length}
            masteredCount={masteredNotes.length}
          />
        </div>
      </header>

      <div className="p-5 sm:p-9 max-w-[1000px]">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          // Skeleton mirrors the row layout so content doesn't jump when it loads
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">読み込み中</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse h-20 rounded-md bg-navy-lt/70"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <MistakesEmptyState
            variant={tab === "active" ? "no-active" : "no-mastered"}
          />
        ) : (
          <div id="mistake-list" role="tabpanel">
            {/* Column header: desktop only, aligned with the rows */}
            <div
              className={[
                "hidden px-3 pb-2.5 border-b border-border",
                ROW_GRID,
                "sm:items-end text-[11px] font-bold text-muted tracking-[0.07em] uppercase",
              ].join(" ")}
            >
              <div>問題</div>
              <div>間違い</div>
              <div>{tab === "active" ? "次の復習日" : "状態"}</div>
              <div />
            </div>

            {notes.map((note) => (
              <MistakeRow
                key={note.id}
                note={note}
                variant={tab}
                onChangeStatus={handleChangeStatus}
                busy={busyId === note.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
