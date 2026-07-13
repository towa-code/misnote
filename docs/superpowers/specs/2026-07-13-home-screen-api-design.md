# ホーム画面の実API接続 — 設計

## 背景

`frontend/src/app/page.tsx` はUIが完成済みだが `MOCK_TODAY_ITEMS` / `MOCK_FUTURE_ITEMS` /
`MOCK_UNSCHEDULED_ITEMS` / `MOCK_ACTIVE_COUNT` のモックデータで動いている。
科目/単元管理・問題登録の2画面は既に実API接続済み（`b062111`, `c011a10`）。
ロードマップ（`docs/ROADMAP.md`）の画面実装順で次はホーム画面。

設計の元になった仕様: `docs/design/screens/home.md`, `docs/design/api/mistake-notes.md`。

## 決定事項（ユーザー確認済み）

1. **復習日未設定への日付設定機能を含める。** home.md 仕様通り、`PUT /mistake-notes/{id}` で
   `next_review_at` を設定できるようにする。
2. **`/review/{id}` へのリンクはそのまま維持する。** 復習画面自体は未実装（別タスク）なので
   現状は遷移先が404になるが、モックデータ時点と同じ挙動であり許容する。

## アーキテクチャ

`register`/`subjects` 画面と同じパターンに揃える。

- `frontend/src/app/page.tsx`: サーバーコンポーネントのまま。`<HomePageHeader />` と
  新規クライアントコンポーネント `<HomeContent />` を返すだけにする。モック配列は削除。
- `frontend/src/components/home/home-content.tsx`（新規, `"use client"`）: データ取得・状態管理・
  イベント処理を集約する。
- `frontend/src/lib/api.ts`: `mistakeNotesApi = new MistakeNotesApi(config)` を追加。

## データ取得

マウント時に `Promise.all` で3本並行取得:

| API | 用途 |
|---|---|
| `listTodayV1MistakeNotesTodayGet()` | 今日の復習一覧（`overdueDays` はクライアント側で `today - next_review_at` の日数差から計算） |
| `listActiveV1MistakeNotesGet()` | 全active一覧。ここから「今日」に含まれない分を `nextReviewAt` が非null かつ today超過なら「明日以降」、nullなら「未設定」に振り分ける。配列長がそのまま summary の「苦手問題」カードの値 |
| `listMasteredV1MistakeNotesMasteredGet()` | 「克服済み」カードの値（`.length`） |

`MistakeNoteResponse` → `ReviewItemData`（`frontend/src/components/home/review-item.tsx` の型）へのマッピング:

```
id            <- note.id
subjectName   <- note.question.subject.name
unitName      <- note.question.unit?.name
questionBody  <- note.question.questionText
wrongCount    <- note.wrongCount
nextReviewAt  <- note.nextReviewAt (Date | null) を "YYYY-MM-DD" 文字列 or null に変換
overdueDays   <- today一覧の項目のみ計算、それ以外は 0
```

## 復習日設定機能

`unscheduledItems` の行（`upcoming-item.tsx` が両方の非today行を描画している）のみ対象。

- 現在「未設定」テキストを表示している左カラムを `<input type="date">` に差し替える。
- `onChange` で即座に `updateNoteV1MistakeNotesNoteIdPut({ noteId, mistakeNoteUpdate: { nextReviewAt } })`
  を呼ぶ（保存ボタンなし、選択したら即確定 — subjects-manager 同様「都度再取得」方式に合わせる）。
- 成功したら3本のリストを再取得し、対象ノートは「未設定」グループから外れる。
- **構造変更が必要**: 現状 `upcoming-item.tsx` は行全体を `<Link href="/review/{id}">` でラップしている。
  `<a>` 内に `<input>` を置くのはHTML的に不正かつクリック競合を起こすため、未設定行のみ
  日付inputをLinkの外側に出す構造にする（Linkは科目名・問題文・間違い回数のセル群のみをラップ）。
  明日以降（future）行は現状通りLinkで行全体をラップしたままで変更なし。
- `upcoming-item.tsx` に `"use client"` を追加し、`onSetReviewDate?: (id: string, date: string) => void`
  相当のコールバックを props で受け取る（親 `HomeContent` から渡す）。

## 空状態・エラー表示

- 空状態は既存の `EmptyState`（`no-notes` / `done-today` バリアント）をそのまま流用。
  判定は `activeCount === 0` → `no-notes`、`todayItems.length === 0 && activeCount > 0` → `done-today`。
- 取得・更新に失敗した場合は、register/subjects と同様に画面上部へ簡易エラーメッセージ帯を表示する。

## スコープ外

- 「明日以降」行への日付変更機能（未設定行のみが対象）
- メモ・学んだこと（`memo`/`learning`）の編集
- 復習フロー本体（`/review/{id}` の実装）
- 問題文の50文字程度への省略表示（既存コンポーネントに元々ない挙動で、今回追加しない）
