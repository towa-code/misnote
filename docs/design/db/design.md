# DB：設計思想・ER図・インデックス

## テーブル関係図

```
users
 ├──< subjects
 │      └──< units
 │
 ├──< questions >── subjects
 │                └── units（nullable）
 │
 ├──< attempts >── questions
 │
 ├──< mistake_notes >── questions
 │
 └──< drafts
```

`drafts`（クイック保存の下書き）は `users` にしか繋がらない。まだ問題になっていないメモなので、
科目にも問題にも紐づかない独立した島として置く。

---

## インデックス

| テーブル | インデックス | 用途 |
|---------|------------|------|
| mistake_notes | (user_id, status, next_review_at) | 「今日の復習」クエリ（`GET /mistake-notes/today`） |
| mistake_notes | UNIQUE (question_id) | 1問題1ノートの保証 |
| questions | (user_id, subject_id) | 問題一覧の科目絞り込み |
| attempts | (question_id, answered_at) | 回答履歴の取得 |
| subjects | (user_id) | 科目一覧 |
| units | (subject_id) | 単元一覧 |

---

## 設計のポイント

- 全テーブルの主キーは UUID。全データは `user_id` でスコープし、他ユーザーのデータにはアクセスできない（`units` は `subject_id` 経由で所有者を判定する）
- `unit_id` はnullableにすることで、単元未分類の問題も登録できる
- `attempts` は同じ問題を何度解いても履歴として残る
- `mistake_notes` は `question_id` にUNIQUE制約を持ち、1問題につき1件。不正解の attempt を記録したとき、ノートが無ければ自動作成し、あれば既存ノートを更新する（重複は作らない）
- `next_review_at` はユーザーが自分で次の復習日を設定する（自動計算しない）
- `drafts` は `questions` と別テーブルにしてある。`questions.subject_id` は NOT NULL なので、`questions` を使う限り「科目すら選ばずに保存」ができないため。本登録は本文を `/register` に流し込んで通常の登録を行い、成功後に下書きを削除する。下書きと問題の間にリレーションは張らない

---

## correct_streak と克服（mastered）のルール

| 操作 | `correct_streak` | `wrong_count` | `status` |
|------|-----------------|--------------|---------|
| 正解 attempt | +1 | 変化なし | 変化なし |
| 不正解 attempt | 0 にリセット | +1 | `mastered` → `active` に戻す |
| `PUT /status` で mastered 化 | 変化なし | 変化なし | `active` → `mastered` |
| `PUT /status` で active 復帰 | 0 にリセット | 変化なし | `mastered` → `active` |

- `correct_streak` が閾値（**3回連続正解**）に達すると、APIが `mastery_suggested: true` を返し、UIが「克服済みにしますか？」と**提案**する
- `mastered` への遷移は常にユーザー操作（自動では遷移しない）。提案の有無にかかわらず手動で克服済みにできる
- `status` が `mastered` の問題は `GET /mistake-notes/today` と `GET /mistake-notes` の結果から外れる

---

## 関連ドキュメント

- [DB: テーブル定義](./schema.md)
- [API: 回答](../api/attempts.md)（correct_streak の更新タイミング）
- [API: 間違いノート](../api/mistake-notes.md)（status 変更）
- [画面設計: 復習](../screens/review.md)（mastery_suggested の表示）
