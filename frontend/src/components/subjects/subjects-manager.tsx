"use client";

import { useEffect, useState } from "react";
import type { SubjectResponse, UnitResponse } from "@/generated";
import { ResponseError } from "@/generated";
import { subjectsApi, unitsApi } from "@/lib/api";

const CONFLICT_MESSAGE = "先に問題を移動または削除してください";

const inputBase =
  "border border-border rounded-md px-3 py-2 text-[13px] bg-white text-text focus:outline-none focus:border-amber focus:shadow-[0_0_0_3px_#FFFBEB]";

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

function EditIcon() {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

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

function isConflict(err: unknown): boolean {
  return err instanceof ResponseError && err.response.status === 409;
}

type EditingUnit = { subjectId: string; unitId: string };

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([]);
  const [unitsBySubject, setUnitsBySubject] = useState<
    Record<string, UnitResponse[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "error" | "notice";
    text: string;
  } | null>(null);

  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(
    null
  );
  const [editingSubjectName, setEditingSubjectName] = useState("");

  const [addingUnitFor, setAddingUnitFor] = useState<string | null>(null);
  const [newUnitName, setNewUnitName] = useState("");

  const [editingUnit, setEditingUnit] = useState<EditingUnit | null>(null);
  const [editingUnitName, setEditingUnitName] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const subjectList = await subjectsApi.listSubjectsV1SubjectsGet();
      setSubjects(subjectList);
      const entries = await Promise.all(
        subjectList.map(async (s) => {
          const units = await unitsApi.listUnitsV1SubjectsSubjectIdUnitsGet({
            subjectId: s.id,
          });
          return [s.id, units] as const;
        })
      );
      setUnitsBySubject(Object.fromEntries(entries));
    } catch {
      setMessage({ type: "error", text: "科目・単元の取得に失敗しました。" });
    } finally {
      setLoading(false);
    }
  }

  async function refreshUnits(subjectId: string) {
    const units = await unitsApi.listUnitsV1SubjectsSubjectIdUnitsGet({
      subjectId,
    });
    setUnitsBySubject((prev) => ({ ...prev, [subjectId]: units }));
  }

  async function handleAddSubject() {
    const name = newSubjectName.trim();
    if (!name) return;
    try {
      await subjectsApi.createSubjectV1SubjectsPost({
        subjectCreate: { name },
      });
      setNewSubjectName("");
      setAddingSubject(false);
      await loadAll();
    } catch {
      setMessage({ type: "error", text: "科目の追加に失敗しました。" });
    }
  }

  async function handleSaveSubjectEdit(subjectId: string) {
    const name = editingSubjectName.trim();
    if (!name) return;
    try {
      await subjectsApi.updateSubjectV1SubjectsSubjectIdPut({
        subjectId,
        subjectUpdate: { name },
      });
      setEditingSubjectId(null);
      await loadAll();
    } catch {
      setMessage({ type: "error", text: "科目の更新に失敗しました。" });
    }
  }

  async function handleDeleteSubject(subject: SubjectResponse) {
    if (!window.confirm(`「${subject.name}」を削除しますか？`)) return;
    try {
      await subjectsApi.deleteSubjectV1SubjectsSubjectIdDelete({
        subjectId: subject.id,
      });
      await loadAll();
    } catch (err) {
      setMessage({
        type: "error",
        text: isConflict(err) ? CONFLICT_MESSAGE : "科目の削除に失敗しました。",
      });
    }
  }

  async function handleAddUnit(subjectId: string) {
    const name = newUnitName.trim();
    if (!name) return;
    try {
      await unitsApi.createUnitV1SubjectsSubjectIdUnitsPost({
        subjectId,
        unitCreate: { name },
      });
      setNewUnitName("");
      setAddingUnitFor(null);
      await refreshUnits(subjectId);
    } catch {
      setMessage({ type: "error", text: "単元の追加に失敗しました。" });
    }
  }

  async function handleSaveUnitEdit(subjectId: string, unitId: string) {
    const name = editingUnitName.trim();
    if (!name) return;
    try {
      await unitsApi.updateUnitV1UnitsUnitIdPut({
        unitId,
        unitUpdate: { name },
      });
      setEditingUnit(null);
      await refreshUnits(subjectId);
    } catch {
      setMessage({ type: "error", text: "単元の更新に失敗しました。" });
    }
  }

  async function handleDeleteUnit(subjectId: string, unit: UnitResponse) {
    if (!window.confirm(`「${unit.name}」を削除しますか？`)) return;
    try {
      await unitsApi.deleteUnitV1UnitsUnitIdDelete({ unitId: unit.id });
      await refreshUnits(subjectId);
    } catch (err) {
      setMessage({
        type: "error",
        text: isConflict(err) ? CONFLICT_MESSAGE : "単元の削除に失敗しました。",
      });
    }
  }

  return (
    <div>
      <div className="bg-white border-b border-border px-9 py-[18px] flex items-center justify-between">
        <h1 className="font-serif text-[20px] font-bold tracking-[0.02em]">
          科目・単元管理
        </h1>
        <button
          type="button"
          onClick={() => {
            setAddingSubject(true);
            setNewSubjectName("");
          }}
          className="flex items-center gap-2 bg-amber text-white rounded-md px-5 py-2.5 text-[13px] font-bold hover:bg-amber-dk transition-colors duration-150"
        >
          <PlusIcon />
          科目を追加
        </button>
      </div>

      <div className="p-9">
        {message && (
          <div
            className={
              "mb-5 rounded-md border px-4 py-3 text-[13px] " +
              (message.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-navy-lt border-border text-navy")
            }
          >
            {message.text}
          </div>
        )}

        {addingSubject && (
          <div className="mb-5 flex items-center gap-2">
            <input
              autoFocus
              className={inputBase}
              placeholder="例：数学"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubject();
                if (e.key === "Escape") setAddingSubject(false);
              }}
            />
            <button
              type="button"
              onClick={handleAddSubject}
              className="bg-amber text-white rounded-md px-4 py-2 text-[12px] font-bold hover:bg-amber-dk transition-colors"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setAddingSubject(false)}
              className="text-muted text-[12px] hover:text-text transition-colors"
            >
              取消
            </button>
          </div>
        )}

        {!loading && subjects.length === 0 && !addingSubject && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[14px] text-muted mb-5">
              まず科目を追加しましょう（例: 数学・英語）
            </p>
            <button
              type="button"
              onClick={() => setAddingSubject(true)}
              className="bg-amber text-white rounded-md px-6 py-3 text-[13px] font-bold hover:bg-amber-dk transition-colors duration-150"
            >
              科目を追加する
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {subjects.map((subject) => {
            const units = unitsBySubject[subject.id] ?? [];
            return (
              <div
                key={subject.id}
                className="bg-white border border-border rounded-md overflow-hidden shadow-sm"
              >
                <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border">
                  {editingSubjectId === subject.id ? (
                    <>
                      <input
                        autoFocus
                        className={inputBase + " flex-1"}
                        value={editingSubjectName}
                        onChange={(e) => setEditingSubjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveSubjectEdit(subject.id);
                          if (e.key === "Escape") setEditingSubjectId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveSubjectEdit(subject.id)}
                        className="bg-amber text-white rounded-md px-3 py-1.5 text-[12px] font-bold hover:bg-amber-dk transition-colors"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSubjectId(null)}
                        className="text-muted text-[12px] hover:text-text transition-colors"
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-serif text-[15px] font-bold tracking-[0.02em]">
                        {subject.name}
                      </span>
                      <span className="text-[12px] text-muted mr-1">
                        {units.length}単元
                      </span>
                      <button
                        type="button"
                        aria-label={`${subject.name}を編集`}
                        onClick={() => {
                          setEditingSubjectId(subject.id);
                          setEditingSubjectName(subject.name);
                        }}
                        className="text-muted hover:text-navy hover:bg-navy-lt rounded p-1.5 transition-colors"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        aria-label={`${subject.name}を削除`}
                        onClick={() => handleDeleteSubject(subject)}
                        className="text-muted hover:text-red-700 hover:bg-red-50 rounded p-1.5 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>

                <div className="py-1.5">
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className="group flex items-center gap-2 px-4 py-2 pl-7"
                    >
                      {editingUnit?.unitId === unit.id ? (
                        <>
                          <input
                            autoFocus
                            className={inputBase + " flex-1"}
                            value={editingUnitName}
                            onChange={(e) =>
                              setEditingUnitName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleSaveUnitEdit(subject.id, unit.id);
                              if (e.key === "Escape") setEditingUnit(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveUnitEdit(subject.id, unit.id)
                            }
                            className="bg-amber text-white rounded-md px-3 py-1.5 text-[12px] font-bold hover:bg-amber-dk transition-colors"
                          >
                            保存
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUnit(null)}
                            className="text-muted text-[12px] hover:text-text transition-colors"
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[12px] text-[#CBD5E1]">—</span>
                          <span className="flex-1 text-[13px] text-navy">
                            {unit.name}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              aria-label={`${unit.name}を編集`}
                              onClick={() => {
                                setEditingUnit({
                                  subjectId: subject.id,
                                  unitId: unit.id,
                                });
                                setEditingUnitName(unit.name);
                              }}
                              className="text-[#CBD5E1] hover:text-navy hover:bg-navy-lt rounded p-1 transition-colors"
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              aria-label={`${unit.name}を削除`}
                              onClick={() => handleDeleteUnit(subject.id, unit)}
                              className="text-[#CBD5E1] hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {addingUnitFor === subject.id ? (
                  <div className="flex items-center gap-2 px-4 py-2 pl-7 border-t border-border">
                    <input
                      autoFocus
                      className={inputBase + " flex-1"}
                      placeholder="例：二次方程式"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddUnit(subject.id);
                        if (e.key === "Escape") setAddingUnitFor(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddUnit(subject.id)}
                      className="bg-amber text-white rounded-md px-3 py-1.5 text-[12px] font-bold hover:bg-amber-dk transition-colors"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingUnitFor(null)}
                      className="text-muted text-[12px] hover:text-text transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingUnitFor(subject.id);
                      setNewUnitName("");
                    }}
                    className="w-full flex items-center gap-1.5 px-4 py-2.5 pl-7 text-[12px] font-bold text-amber border-t border-border hover:bg-amber-lt transition-colors"
                  >
                    <PlusIcon />
                    単元を追加
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
