# DB：テーブル定義

## テーブル一覧

| テーブル | 役割 |
|---------|------|
| `users` | ユーザー情報 |
| `subjects` | 科目 |
| `units` | 単元（科目の下の階層） |
| `questions` | 問題 |
| `attempts` | 回答履歴 |
| `mistake_notes` | 間違いノート＋復習管理 |
| `drafts` | クイック保存の下書き（まだ問題になっていないメモ） |

---

## `users`（ユーザー）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| cognito_sub | VARCHAR | Cognito のユーザーID（UNIQUE、nullable） |
| email | VARCHAR | メールアドレス（UNIQUE） |
| name | VARCHAR | 表示名 |
| created_at | TIMESTAMP | 作成日時 |

> 認証は段階的に移行する（[ROADMAP](../../ROADMAP.md) 参照）。Phase 3 のローカルJWT期間は `password_hash VARCHAR` を追加して使い、Phase 4 で Cognito に切り替えた時点で `cognito_sub` に紐付ける。

---

## `subjects`（科目）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | → users |
| name | VARCHAR | 科目名（数学・英語など） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## `units`（単元）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| subject_id | UUID | → subjects |
| name | VARCHAR | 単元名（二次方程式など） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## `questions`（問題）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | → users |
| subject_id | UUID | → subjects |
| unit_id | UUID | → units（nullable） |
| question_text | TEXT | 問題文 |
| correct_answer | TEXT | 正解 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

> `unit_id` を指定する場合、その単元は `subject_id` の科目に属していなければならない（アプリケーション側で検証する）

---

## `attempts`（回答履歴）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | → users |
| question_id | UUID | → questions |
| user_answer | TEXT | 自分の答え（任意・nullable） |
| is_correct | BOOLEAN | 正解かどうか |
| answered_at | TIMESTAMP | 回答日時 |

---

## `mistake_notes`（間違いノート）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | → users |
| question_id | UUID | → questions（**UNIQUE**：1問題につきノートは1件） |
| memo | TEXT | 間違えた理由・ポイント |
| learning | TEXT | 今回学んだこと |
| reason_tag | VARCHAR(32) | 間違いの原因タグ（nullable = 未分類）。値は misread / approach / knowledge / calculation / time / other。値の妥当性は Pydantic が保証し、DB 側に制約は置かない（タグ一覧が変わる前提のため） |
| status | ENUM | active / mastered（デフォルト active） |
| wrong_count | INTEGER | 間違えた回数（作成時 1） |
| correct_streak | INTEGER | 連続正解回数（デフォルト 0） |
| next_review_at | DATE | ユーザーが設定する次の復習日（nullable） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## `drafts`（下書き）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | → users |
| body | TEXT | 書き留めた本文 |
| created_at | TIMESTAMP | 作成日時 |

> クイック保存で「問題文だけ」を書き留めるためのテーブル。`questions` は `subject_id` が NOT NULL なので、科目を選ばずに保存するにはこの独立したテーブルが要る。
> 下書きは編集せず、本登録するか削除するかのどちらかなので `updated_at` は持たない。本登録は `/register?draft={id}` で本文を流し込み、成功後に下書きを削除する（データとしての引き継ぎは本文のみで、リレーションは残さない）。

---

## 関連ドキュメント

- [DB: 設計思想・ER図・インデックス](./design.md)
- [API: 問題](../api/questions.md)
- [API: 回答](../api/attempts.md)
- [API: 間違いノート](../api/mistake-notes.md)
- [API: 下書き](../api/drafts.md)
