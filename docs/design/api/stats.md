# API：統計（stats）

ベースURL: `https://api.misnote.com/v1` / 認証・エラー: [共通仕様](./conventions.md)

集計値だけを返す読み取り専用のリソース。専用のテーブルは持たず、既存テーブルを `user_id` スコープで数える。

## エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/stats/summary` | 克服率の件数取得 |

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

## 関連ドキュメント

- [共通仕様](./conventions.md)
- [間違いノートAPI](./mistake-notes.md)
- [共通UI仕様](../screens/common-ui.md)
- [機能案：統計ダッシュボード](../../newfunction/stats-dashboard.md)
