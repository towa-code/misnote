# API：統計（stats）

ベースURL: `https://api.misnote.com/v1` / 認証・エラー: [共通仕様](./conventions.md)

集計値だけを返す読み取り専用のリソース。専用のテーブルは持たず、既存テーブルを `user_id` スコープで数える。

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/stats/summary` | 克服率の件数取得 |
| GET | `/stats/reason-tags` | 教科 × 単元 × 原因タグの件数取得 |

---

## 克服率の件数取得
`GET /stats/summary`

サイドバー最下部の克服率バーが使う。分子・分母の生の件数を返し、**割合の計算は表示側でおこなう**（0除算の扱いを表示側に閉じ込めるため、また `12 / 27` の表示に生の件数が要るため）。

**レスポンス**
```json
{
  "mastered_count": 12,
  "total_count": 27
}
```

| フィールド | 内容 |
|------|------|
| `mastered_count` | `status = "mastered"` の間違いノート件数 |
| `total_count` | 間違いノートの総件数（`active` + `mastered`） |

- 母数は「一度でも間違えた問題」。登録しただけで間違いノートを持たない問題は数えない
- ノートが1件もないアカウントは `{"mastered_count": 0, "total_count": 0}` を返す

---

## 原因タグの件数取得
`GET /stats/reason-tags`

分析画面（`/stats`）が使う。教科 × 単元 × 原因タグの組ごとに1行を返す。割合・比較・分析文はすべて表示側で作る。

**レスポンス**
```json
{
  "rows": [
    {
      "subject_id": "…",
      "subject_name": "数学",
      "unit_id": "…",
      "unit_name": "数列",
      "reason_tag": "approach",
      "note_count": 5,
      "mastered_count": 1,
      "wrong_count_sum": 12
    }
  ]
}
```

| フィールド | 内容 |
|------|------|
| `unit_id` / `unit_name` | 単元なしの問題は `null` |
| `reason_tag` | 未設定のノートは `null` の行にまとまる |
| `note_count` | 間違いノート件数（`active` + `mastered`） |
| `mastered_count` | そのうち `status = "mastered"` の件数 |
| `wrong_count_sum` | `wrong_count` の合計 |

- 克服済みのノートも含める。「どう間違えがちか」の傾向を見るため
- ノートが1件もないアカウントは `{"rows": []}` を返す

---

## 関連ドキュメント

- [共通仕様](./conventions.md)
- [間違いノートAPI](./mistake-notes.md)
- [共通UI仕様](../screens/common-ui.md)
- [機能案：統計ダッシュボード](../../newfunction/stats-dashboard.md)
