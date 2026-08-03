import { MistakeNoteResponseReasonTagEnum } from "@/generated";

// 間違いの原因タグ。API と DB には英語キーだけが流れ、日本語ラベルはここにしかない。
// 生成クライアントはスキーマごとに別々の enum を作るが、値はどれも同じ文字列なので
// 代表として MistakeNoteResponse のものを型として使う。
export type ReasonTag = MistakeNoteResponseReasonTagEnum;

// 並び順は「解く過程のどこで失敗したか」（読む → 方針 → 知識 → 手を動かす → 時間）。
export const REASON_TAGS: { value: ReasonTag; label: string }[] = [
  { value: "misread", label: "読み間違い" },
  { value: "approach", label: "解き方が思いつかなかった" },
  { value: "knowledge", label: "覚えていなかった" },
  { value: "calculation", label: "計算・作業ミス" },
  { value: "time", label: "時間切れ" },
  { value: "other", label: "その他" },
];

export function reasonTagLabel(tag: ReasonTag): string {
  return REASON_TAGS.find((t) => t.value === tag)?.label ?? tag;
}
