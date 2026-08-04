# API：回答（attempts）

ベースURL: `https://api.misnote.com/v1` / 認証・エラー: [共通仕様](./conventions.md)

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/questions/{id}/attempts` | 回答を記録 |
| GET | `/questions/{id}/attempts` | 回答履歴一覧取得 |

---

## 回答を記録
`POST /questions/{id}/attempts`

**リクエスト**
```json
{
  "user_answer": "x = 3",
  "is_correct": false
}
```

> `user_answer` は省略可（自己採点方式のため、答えを書かずに正誤だけ記録できる）

**レスポンス**
```json
{
  "id": "uuid",
  "question_id": "uuid",
  "user_answer": "x = 3",
  "is_correct": false,
  "answered_at": "2024-01-01T00:00:00",
  "mistake_note_id": "uuid",
  "correct_streak": 0,
  "mastery_suggested": false,
  "suggested_next_review_at": "2024-01-02"
}
```

### mistake_notes への副作用

| 条件 | 挙動 |
|------|------|
| 不正解・ノート無し | ノートを自動作成（`wrong_count=1`、`correct_streak=0`、`next_review_at=null`。復習日はユーザーが後から設定する） |
| 不正解・ノート有り | 既存ノートを更新：`wrong_count` +1、`correct_streak` を 0 にリセット。`mastered` だった場合は `active` に戻す（重複ノートは作らない） |
| 正解・ノート有り | `correct_streak` +1 |
| 正解・ノート無し | 何もしない（`mistake_note_id`・`correct_streak`・`mastery_suggested`・`suggested_next_review_at` は `null`） |

> `mastery_suggested` は更新後の `correct_streak` が **3 以上**のとき `true`。フロントエンドはこれを見て「克服済みにしますか？」と提案する（mastered への変更は別途 `PUT /mistake-notes/{id}/status` で行う。自動では遷移しない）

### 復習日の提案（suggested_next_review_at）

更新後の `correct_streak` から次回復習日を提案する。`mastery_suggested` と同じく**提案するだけ**で、
`next_review_at` は書き換えない（設定は `PUT /mistake-notes/{id}`）。

| correct_streak（解答後） | 提案日 |
|---|---|
| 0（間違えた直後） | 翌日 |
| 1 | 3日後 |
| 2 | 7日後 |
| 3以上 | 14日後 |

基準日は `date.today()`。間隔は `routers/attempts.py::SUGGEST_INTERVALS` の1箇所で定義する。
設計は [復習日の自動提案](../../superpowers/specs/2026-08-04-review-interval-suggestion-design.md) を参照。

---

## 回答履歴一覧取得
`GET /questions/{id}/attempts`

**レスポンス**
```json
[
  {
    "id": "uuid",
    "question_id": "uuid",
    "user_answer": "x = 3",
    "is_correct": false,
    "answered_at": "2024-01-01T00:00:00"
  }
]
```

> `answered_at` の降順で返す

---

## 関連ドキュメント

- [共通仕様](./conventions.md)
- [問題API](./questions.md)
- [間違いノートAPI](./mistake-notes.md)
- [DB: テーブル定義](../db/schema.md)
- [DB: 設計思想](../db/design.md)（correct_streak・mastery ルール）
