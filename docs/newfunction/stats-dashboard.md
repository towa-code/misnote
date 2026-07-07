# 機能案：統計ダッシュボード

> ⚠️ **エージェントへ：** この機能は構想段階です。ユーザーが明示的に実装を指示するまで実装しないでください。

**目的：** 「どれだけ克服できたか」「どこが弱点か」「どれだけ続けられているか」を数字で見せ、学習のモチベーションと自己分析を支える。

---

## 概要（UX）

`/stats` ページに次のカード・グラフを置く:

| 指標 | 内容 | データ源 |
|------|------|---------|
| 克服率 | mastered ÷ 全 mistake_notes | `mistake_notes.status` |
| 苦手上位の科目・単元 | note 数と `wrong_count` 合計の多い順 | `mistake_notes` × `questions` |
| 復習アクティビティ | 直近30日の解答数の推移（棒グラフ） | `attempts.answered_at` |
| 継続日数 | 解答記録がある日の連続日数（streak） | `attempts.answered_at` |
| 間違いの原因内訳 | 原因タグ別の割合（円 or 横棒） | `mistake_notes.reason_tag`（[原因タグ](./mistake-reason-tags.md)導入後） |

まずは数値カード＋単純な棒グラフから。凝ったグラフライブラリは後回しでよい。

---

## API/DB 変更点

新テーブルは不要。既存テーブルの集計（GROUP BY）だけで作れる。

| メソッド | パス | 返す内容 |
|---------|------|---------|
| GET | `/v1/stats/summary` | 全体件数・克服率・継続日数 |
| GET | `/v1/stats/by-subject` | 科目（・単元）別の note 数 / wrong_count 合計 / 克服率 |
| GET | `/v1/stats/activity?days=30` | 日別の解答数（正解/不正解内訳つき） |
| GET | `/v1/stats/reason-tags` | 原因タグ別件数（タグ機能導入後） |

新ルーター `app/routers/stats.py` を作り、`main.py` で `/v1/stats` にマウントする（既存ルーターと同じパターン）。すべて `user_id` スコープの集計クエリ。

---

## 実装ステップ

1. `app/routers/stats.py`＋レスポンススキーマ `app/schemas/stats.py` を追加、`main.py` にマウント
2. `openapi.json` 再生成 → `npm run generate`
3. フロントに `/stats` ページ（まず数値カードのみ → 棒グラフ追加）
4. ナビゲーションに統計への導線を追加

---

## 検討事項・トレードオフ

- グラフ描画: 依存を増やさず CSS/SVG の単純な棒で始めるか、Recharts 等を入れるか。**新規依存の導入はユーザー承認が必要**（CLAUDE.md のルール）
- 継続日数（streak）の定義: 「解答した日」ベースか「登録も含む活動日」ベースか。まずは解答日ベースが実装も意味も単純
- データが少ない初期は寂しい画面になる → 空状態の文言・「まず1問復習しよう」導線を用意する
- 学生向けのゲーミフィケーション（克服数バッジ等）は本案には含めない（別途検討）

## 関連ドキュメント

- [機能案：間違い原因タグ](./mistake-reason-tags.md)
- [DB設計](../design/db/design.md)
- [API規約](../design/api/conventions.md)
