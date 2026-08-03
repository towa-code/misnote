# API：問題（questions）

ベースURL: `https://api.misnote.com/v1` / 認証・エラー: [共通仕様](./conventions.md)

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/questions` | 問題一覧取得 |
| GET | `/questions/{id}` | 問題詳細取得 |
| POST | `/questions` | 問題作成 |
| PUT | `/questions/{id}` | 問題更新 |
| DELETE | `/questions/{id}` | 問題削除 |

---

## 問題一覧取得
`GET /questions`

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| subject_id | UUID | No | 科目で絞り込む |
| unit_id | UUID | No | 単元で絞り込む |
| limit / offset | INTEGER | No | ページネーション（[共通仕様](./conventions.md) 参照） |

**レスポンス**
```json
[
  {
    "id": "uuid",
    "subject": { "id": "uuid", "name": "数学" },
    "unit": { "id": "uuid", "name": "二次方程式" },
    "question_text": "次の方程式を解け: 2x + 3 = 7",
    "correct_answer": "x = 2",
    "created_at": "2024-01-01T00:00:00"
  }
]
```

> `unit` は登録時に未指定の場合 `null` になる

---

## 問題詳細取得
`GET /questions/{id}`

**レスポンス**
```json
{
  "id": "uuid",
  "subject": { "id": "uuid", "name": "数学" },
  "unit": { "id": "uuid", "name": "二次方程式" },
  "question_text": "次の方程式を解け: 2x + 3 = 7",
  "correct_answer": "x = 2",
  "created_at": "2024-01-01T00:00:00"
}
```

---

## 問題作成
`POST /questions`

**リクエスト**
```json
{
  "subject_id": "uuid",
  "unit_id": "uuid",
  "question_text": "次の方程式を解け: 2x + 3 = 7",
  "correct_answer": "x = 2",
  "memo": "符号のミスに注意",
  "learning": "移項するとき符号が反転することを公式として覚える",
  "reason_tag": "calculation",
  "next_review_at": "2024-01-08"
}
```

> `unit_id`・`learning`・`reason_tag`・`next_review_at` は省略可。`unit_id` を指定する場合は `subject_id` の科目に属する単元であること（違反時は 400）。  
> `memo`・`learning`・`reason_tag`・`next_review_at` の**いずれかが指定された場合**、`mistake_notes` レコードが自動で作成される（初期値: `status=active`、`wrong_count=1`、`correct_streak=0`、`next_review_at` 未指定時は `null`）。  
> `reason_tag` に取りうる値は misread / approach / knowledge / calculation / time / other。それ以外は 422。  
> 実装との差異: `memo` は現在**必須**（`QuestionCreate.memo` が `min_length=1`）。そのため上の自動作成条件は事実上つねに成立する。任意に戻す案は [クイック保存](../../newfunction/quick-save.md) を参照。

**レスポンス**
```json
{
  "id": "uuid",
  "subject": { "id": "uuid", "name": "数学" },
  "unit": { "id": "uuid", "name": "二次方程式" },
  "question_text": "次の方程式を解け: 2x + 3 = 7",
  "correct_answer": "x = 2",
  "created_at": "2024-01-01T00:00:00",
  "mistake_note_id": "uuid"
}
```

> `memo`・`learning`・`next_review_at` をいずれも渡さなかった場合、`mistake_note_id` は `null`

---

## 問題更新
`PUT /questions/{id}`

**リクエスト**
```json
{
  "subject_id": "uuid",
  "unit_id": "uuid",
  "question_text": "次の方程式を解け: 3x + 6 = 12",
  "correct_answer": "x = 2"
}
```

**レスポンス** — `GET /questions/{id}` と同じ形

> `unit_id` は `subject_id` の科目に属する単元であること（違反時は 400）

---

## 問題削除
`DELETE /questions/{id}`

**レスポンス**
- `204 No Content`

> 紐づく `attempts`・`mistake_notes` もカスケード削除される

---

## 関連ドキュメント

- [共通仕様](./conventions.md)
- [回答API](./attempts.md)
- [間違いノートAPI](./mistake-notes.md)
- [DB: テーブル定義](../db/schema.md)
