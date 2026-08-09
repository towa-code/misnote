# 設計：サイドバーの克服率バー

- 日付: 2026-08-09
- 対象: [モックアップ `00_prototype.html`](../../design/mockups/00_prototype.html) の `.sidebar-bottom`

---

## 目的

デスクトップのサイドバー最下部に、モックアップどおりの克服率バーを出す。「克服率」ラベル・進捗バー・「12 問克服 / 全 27 問」の3行。

アプリのどの画面にいても、克服がどこまで進んでいるかが目に入る状態にする。

---

## 分母の定義

**克服率 = mastered な mistake_note ÷ 全 mistake_note（active + mastered）**

「一度でも間違えた問題」を母数にする。登録しただけでまだ間違えていない問題（`mistake_notes` を持たない `question`）は数えない。克服すべき対象がない問題を分母に入れると、克服率が構造的に低く出て意味が薄れるため。

モックの「全 27 問」という字面は questions の総数とも読めるが、採らない。

---

## API

`app/routers/stats.py` を新設し、`/v1/stats` にマウントする。エンドポイントは1本だけ。

### `GET /v1/stats/summary` → 200

```json
{ "mastered_count": 12, "total_count": 27 }
```

- `user_id` スコープの COUNT のみ。新テーブルもマイグレーションも不要
- PostgreSQL の `FILTER` 句で1クエリにまとめる

```python
total_count, mastered_count = (
    db.query(
        func.count(MistakeNote.id),
        func.count(MistakeNote.id).filter(MistakeNote.status == "mastered"),
    )
    .filter(MistakeNote.user_id == user_id)
    .one()
)
```

- 割合は返さない。0除算の扱いを表示側に閉じ込めたいのと、`12 / 27` の表示にどのみち生の件数が要るため

### スコープ

backlog の [stats-dashboard.md](../../newfunction/stats-dashboard.md) は `/v1/stats` に4本（`summary` / `by-subject` / `activity` / `reason-tags`）を提案しているが、**本件では `summary` の、このバーに必要な2フィールドだけを作る。** 継続日数・科目別集計・原因タグ内訳・`/stats` 画面は含めない。

---

## 画面

### `components/layout/mastery-progress.tsx`（新規）

`sidebar.tsx` の `<nav>` の後ろに置く。`<nav>` は既に `flex-1` なので、モックの `margin-top: auto` 相当は追加なしで効く。

- サイドバーは `hidden lg:flex`。**CSS で隠れるだけで React 上はモバイルでもマウントされるため、`/v1/stats/summary` は画面幅に関係なく呼ばれる**（表示はされない）。COUNT 1本の軽いリクエストなので、`matchMedia` で抑止する複雑さは足さない
- `usePathname()` を effect の依存に入れ、**画面遷移のたびに再取得する。** サイドバーは `AppShell` に一度マウントされたきりなので、これがないと復習画面で克服してもバーが動かない
- **読み込み中と取得失敗時は何も描画しない。** 0% のバーを先に出すと「克服率0」に見えるため。サイドバーの補助表示なので、失敗してもエラーは出さず黙って消える
- ノート0件（新規ユーザー）のときは 0% のバーと「0 問克服 / 全 0 問」。空状態専用の文言は作らない（文言はまとめて決める）

### スタイル

モックの CSS をそのまま Tailwind に写す。

| モック | Tailwind |
|---|---|
| `border-top: 1px solid rgba(255,255,255,0.08)` / `padding: 16px` | `border-t border-white/10 p-4` |
| ラベル 11px `rgba(255,255,255,0.55)` `letter-spacing: .08em` | `text-[11px] text-white/55 tracking-[0.08em]` |
| バー枠 `rgba(255,255,255,0.12)` 高さ5px 角丸99px | `h-[5px] rounded-full bg-white/12` |
| バー塗り `var(--amber-br)` | `bg-amber-br` |
| 数値 12px `rgba(255,255,255,0.6)` / `strong` は `0.8` | `text-xs text-white/60` / `text-white/80` |

`text-transform: uppercase` は日本語に効かないので落とす。

---

## テスト

`backend/tests/test_stats.py`（既存の `client` フィクスチャを使用）:

- ノートが1件もないアカウントは `0 / 0` を返す
- active と mastered の両方を `total_count` に数え、`mastered_count` は mastered だけを数える
- 他人のノートを数えない（`test_ownership.py` に追加）

---

## ドキュメント更新

| ファイル | 内容 |
|---|---|
| `docs/design/api/stats.md` | 新規。エンドポイント契約 |
| `docs/design/api/conventions.md` | エンドポイント一覧に stats を追加 |
| `docs/design/screens/common-ui.md` | サイドバーの克服率バーを追記 |
| `docs/newfunction/stats-dashboard.md` | `summary` の一部が実装済みである旨を追記 |
| `CLAUDE.md`（リポジトリルート） | stats ルーターと克服率の定義を追記 |

---

## 積み残し

- 文言（「克服率」「◯ 問克服 / 全 ◯ 問」）は暫定。クイック保存の文言と合わせて決める
- モバイルでの克服率表示。ボトムナビは5項目で既に窮屈なので、置くなら別途設計が要る
