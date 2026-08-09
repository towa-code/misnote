# 設計：クイック保存（下書き）

- 日付: 2026-08-09
- 対象機能案: [docs/newfunction/quick-save.md](../../newfunction/quick-save.md)

---

## 目的

間違えた問題を、科目も理由も選ばずに**問題文だけ**で書き留められるようにする。授業中や模試の直後に手を止めずに記録し、落ち着いてから科目・理由・復習日を付けて本登録する、という2段階の使い方を可能にする。

---

## 採用した設計と、当初案からの変更

機能案 `quick-save.md` の当初案（A案）は「`QuestionCreate.memo` を任意化し、mistake_note を持たない question を『未整理』として扱う」というものだった。**この案は採用しない。**

代わりに、**`drafts` という独立したリソース**を新設する。クイック保存は「まだ問題ではないメモ」を置く場所であり、`questions` / `mistake_notes` とは別のライフサイクルを持つ、と捉える。

この判断の理由:

- 既存の登録フロー（`POST /v1/questions`）と `memo` 必須（コミット d9d14c4 で意図的に入れられた制約）に一切手を触れずに済む。方針転換が不要になる
- 「未整理」を note の有無という**暗黙の状態**で表現せずに済む。`/today`・`/mastered`・mastery 遷移など既存のドメインロジックに影響が出ない
- `questions.subject_id` は NOT NULL なので、questions を使う限り「科目すら選ばずに保存」はできない。別テーブルにして初めて**本文だけの保存**が成立する

当初案に含まれていた次の3つは、**本機能のスコープ外**とする:

| 項目 | 扱い |
|---|---|
| `QuestionCreate.memo` の任意化 | やらない。登録フォームの必須項目は現状維持 |
| ホーム画面の「未整理の問題」セクション | やらない。下書きの一覧は `/quick` にのみ置く |
| 整理画面（note をあとから作る API・画面） | やらない。本登録は既存の `/register` を再利用する |

なお「登録済みの問題にあとから正解を書き足す手段がない」という穴が調査中に見つかったが、これはクイック保存が作った穴ではなく既存の穴（問題編集画面が存在しない）なので、本機能には含めず backlog に切り出す。

---

## データモデル

新テーブル `drafts` を追加する。既存テーブルの変更はない。

| カラム | 型 | 制約 |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, NOT NULL |
| `body` | Text | NOT NULL |
| `created_at` | timestamptz | NOT NULL, server_default `now()` |

- `updated_at` は持たない。下書きは編集せず、保存するか削除するかのどちらかだから
- 科目は持たない。1つでもセレクトを置くと「本文だけを打ち込む」軽さが失われる。科目は本登録時に選ぶ
- `User` モデルに `drafts` リレーションを追加する（既存の `mistake_notes` 等に倣う）
- Alembic マイグレーションを1本追加する

---

## API

`app/routers/drafts.py` を新設し、`/v1/drafts` にマウントする。全クエリを `user_id` でスコープする既存方針に従う。

### `POST /v1/drafts` → 201

リクエスト:
```json
{ "body": "..." }
```

`body` は `min_length=1`（空文字は 422）。レスポンスは `DraftResponse`。

### `GET /v1/drafts` → 200

自分の下書きを `created_at DESC`（新しい順）で返す。`limit` / `offset` は既存慣例どおり 100 / 0 を既定値とする。

### `GET /v1/drafts/{draft_id}` → 200

本登録画面（`/register?draft={id}`）が本文を読み込むために使う。他人の下書き・存在しない ID はいずれも 404。

> 当初のスペックでは3本（POST / GET一覧 / DELETE）としていたが、prefill には1件取得が要るため実装時に追加した。

### `DELETE /v1/drafts/{draft_id}` → 204

他人の下書き・存在しない ID はいずれも 404。

### スキーマ（`app/schemas/draft.py`）

```python
class DraftCreate(BaseModel):
    body: str = Field(..., min_length=1)

class DraftResponse(BaseModel):
    id: UUID
    body: str
    created_at: datetime
```

---

## 画面

### `/quick`（クイック保存ページ）

`app/quick/page.tsx` は薄く、実体は `components/quick/quick-content.tsx` に置く（既存の慣例どおり）。

- ページ上部に「＋ 新しく保存」ボタン。押すと保存モーダルが開く
- その下に下書き一覧（新しい順）。各行に本文・保存日時・「登録する」・「削除」
- 下書きが0件のときは空状態を表示する（`components/quick/empty-state.tsx`）

### 保存モーダル（`components/quick/quick-save-modal.tsx`）

**アプリ内で最初のモーダルになる**（既存のダイアログ実装はない）。ネイティブの `<dialog>` 要素と `showModal()` を使う。Escape での閉じる・フォーカストラップ・背景の inert 化・バックドロップをブラウザが担保するので、自前実装より事故が少ない。

> 実装時にハマった点：Tailwind の preflight が全要素に `margin: 0` を当てるため、`<dialog>` 既定の `margin: auto` による中央寄せが潰れて左上に貼り付く。`m-auto` を明示する。

- 中身はテキストエリアと「保存」ボタンのみ
- **保存してもモーダルは閉じない。** 入力欄をクリアし「保存しました」を表示して、背後の一覧を更新する。授業中に何問も連続で打ち込むのがこの機能の使い所なので、1問ごとに開き直させない
- 閉じるのは明示的に閉じたときだけ（閉じるボタン・Escape・バックドロップ）
- 空のまま保存は不可（ボタンを無効化）

### `/register?draft=<id>`（本登録）

- `draft` クエリがあれば下書きを取得し、問題文に prefill する
- 登録に成功したら `DELETE /v1/drafts/{id}` を呼び、下書きを片付けてから `/` に遷移する
- 下書きの取得に失敗した場合（すでに削除済みなど）は prefill せず、通常の登録画面として動作させる
- **下書きの削除に失敗しても登録自体は成功しているので、エラーで止めずに `/` へ進む。** 下書きが一覧に残るだけで、ユーザーは手動で消せる
- Next.js 16 の `useSearchParams` は Suspense 境界が要る（`node_modules/next/dist/docs/` で確認）。そこで `app/register/page.tsx` を server component のまま `searchParams`（Promise）を `await` し、`draftId` を props で渡す形にした。フックも Suspense 境界も使わない

### ナビゲーション

`components/layout/nav-items.tsx::NAV_ITEMS` に「クイック保存」を追加する。ここが単一の定義元なので、デスクトップのサイドバーとモバイルのボトムナビが両方拾う。入口の軽さが目的の機能なので、ボトムナビから1タップで届くことに意味がある。

ボトムナビが4→5項目になる。実測すると、ラベル「クイック保存」は 11px で 68px 幅。375px 端末は1セル 75px で収まるが、320px 端末は1セル 64px で折り返す。

### API クライアント

`src/lib/api.ts` に `draftsApi` を追加する。手書き `fetch` は書かず、`npm run generate` で生成したクライアントを使う。

---

## テスト

`backend/tests/test_drafts.py` を追加する（既存の `client` フィクスチャを使用）:

- `POST /v1/drafts` が 201 を返し、本文が保存される
- `body` が空文字なら 422
- `GET /v1/drafts` が新しい順に返る
- `GET /v1/drafts` が他人の下書きを返さない
- `GET /v1/drafts/{id}` が本文を返す
- `DELETE /v1/drafts/{id}` が 204、削除後は一覧から消える
- 他人の下書きの取得・削除は 404
- 存在しない ID の取得・削除は 404

---

## ドキュメント更新

| ファイル | 内容 |
|---|---|
| `docs/design/api/drafts.md` | 新規。エンドポイント契約 |
| `docs/design/api/conventions.md` | エンドポイント一覧に drafts を追加 |
| `docs/design/db/schema.md` | drafts テーブルを追加 |
| `docs/design/db/design.md` | ER 図と設計理由に drafts を追加 |
| `docs/design/screens/quick-save.md` | 新規。画面仕様 |
| `docs/design/screens/transitions.md` | `/quick` と `/register?draft=` の遷移を追加 |
| `docs/newfunction/quick-save.md` | 実装済みマーク＋**当初案（A案）ではなく drafts 方式を採用した**旨に書き換え |
| `docs/newfunction/README.md` | 一覧表と推奨順を更新 |
| `CLAUDE.md`（リポジトリルート） | drafts リソースと `/quick` 画面を追記 |

---

## 文言について

ページタイトル・モーダルのプレースホルダー・空状態の文言は、実装の最後に単独で決める。misnote では文言の質が「何を書くか」の質を直接左右するため、コードと同じ扱いにしない。

---

## 積み残し（backlog 行き）

- 登録済みの問題を編集する画面（正解をあとから書き足せない穴）
- 下書きの編集（現状は削除して保存し直す）
- 下書きの写真対応（[photo-upload.md](../../newfunction/photo-upload.md) と合流させると「撮るだけ」の記録になる）
