"use client";

import type { SubjectResponse } from "@/generated";
import { SelectWrapper } from "@/components/form/field-parts";
import { inputBase } from "@/lib/form-styles";

type Props = {
  subjects: SubjectResponse[];
  value: string | null;
  onChange: (next: string | null) => void;
};

/**
 * 科目での絞り込み。科目はユーザーごとに増えるので、タグのようなチップではなく
 * ドロップダウンにする。選択肢は表示中の問題からではなく全科目から作る
 * （問題を全部移し終えた科目でも、選んだまま「0件」を見せられるように）。
 */
export default function SubjectFilterSelect({ subjects, value, onChange }: Props) {
  return (
    <div className="max-w-[240px]">
      <SelectWrapper>
        <select
          aria-label="科目で絞り込む"
          className={inputBase + " appearance-none pr-8 cursor-pointer"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">すべての科目</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </SelectWrapper>
    </div>
  );
}
