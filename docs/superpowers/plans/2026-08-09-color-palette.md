# 配色刷新（青ベース）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `frontend/` の配色を Tailwind 既製 swatch の寄せ集めから、青を主役にした独自パレットへ全面的に置き換える。色の意味を4つ（青＝未克服/行動、緑＝克服済み、金＝遅れ、赤＝間違い/エラー）に絞る。

**Architecture:** `globals.css` の `@theme` に新トークンを**旧トークンと併存させて**追加し、画面グループごとに参照を移し替え、最後に旧トークンを削除する。各タスクの終了時点で常にビルドが通る状態を保つ。`amber` は CTA・ブランド・警告・エラーの4役を兼務していたため機械的な一括置換はできず、出現箇所ごとに意味を判定して振り分ける。

**Tech Stack:** Next.js 16.2.9 / React 19 / Tailwind CSS v4（`@theme` ディレクティブ、設定ファイルなし）/ TypeScript

## Global Constraints

- 本文に使う色は **WCAG AA 4.5:1 以上**。仕様書 `docs/superpowers/specs/2026-08-09-color-palette-design.md` のコントラスト表が実測値の正。
- **`--color-late`（金 `#E0A32E`）を文字色に使わない。白文字を金地に載せることも禁止**（どちらも 2.2:1）。金は「地・帯・バッジの塗り」専用で、その上の文字は `text-ink`。
- **`--color-primary-br` と `--color-mint` は ink 面の上でのみ使う。** 白地では AA を満たさない。
- 色だけで意味を伝えない。遅延表示は必ずアイコンかテキストを伴う。
- **新規依存を追加しない。** フロントエンドにテストランナーは無く、本計画でも導入しない（CLAUDE.md「依存追加は要相談」）。検証は `npm run lint` / `npm run build` / grep アサーション / モックアップとの目視比較で行う。
- Next.js 16 は学習データと異なる破壊的変更を含む。Next.js の API に触れる必要が出たら `frontend/node_modules/next/dist/docs/` を確認する（`frontend/AGENTS.md`）。
- 差分は最小に保つ。配色に無関係なリファクタ・整形を混ぜない。
- ブランチは `feature/color-palette`（`main` 起点）。

## 対象ファイル一覧

**トークン定義**
- Modify: `frontend/src/app/globals.css` — `@theme` のカラートークン、`:focus-visible`、`body`

**レイアウト・ナビ**
- Modify: `frontend/src/components/layout/sidebar.tsx`, `bottom-nav.tsx`
- Modify: `frontend/src/components/auth/auth-card.tsx`

**ホーム**
- Modify: `frontend/src/components/home/summary-cards.tsx`（構造変更あり）, `review-item.tsx`, `upcoming-item.tsx`, `page-header.tsx`, `empty-state.tsx`, `review-list.tsx`, `sub-header.tsx`, `home-content.tsx`

**苦手問題一覧**
- Modify: `frontend/src/components/mistakes/mistake-row.tsx`, `mistake-tabs.tsx`, `mistakes-content.tsx`, `empty-state.tsx`, `tag-filter.tsx`
- Modify: `frontend/src/components/reason-tag/tag-badge.tsx`, `tag-picker.tsx`

**復習**
- Modify: `frontend/src/components/review/review-flow.tsx`, `judge-panel.tsx`（不正解パネルの色替えあり）, `question-card.tsx`
- Modify: `frontend/src/components/review-date/date-chip.tsx`

**フォーム・認証・その他**
- Modify: `frontend/src/lib/form-styles.ts`
- Modify: `frontend/src/components/register/register-form.tsx`
- Modify: `frontend/src/components/auth/login-form.tsx`, `signup-form.tsx`
- Modify: `frontend/src/components/account/account-panel.tsx`
- Modify: `frontend/src/components/subjects/subjects-manager.tsx`
- Modify: `frontend/src/components/quick/quick-content.tsx`, `draft-row.tsx`, `empty-state.tsx`, `quick-save-modal.tsx`
- Modify: `frontend/src/app/layout.tsx`

**ドキュメント・モックアップ**
- Modify: `docs/design/screens/common-ui.md`
- Modify: `docs/design/mockups/02_register.html`, `03_mistake_list.html`, `04_subjects.html`, `05_review.html`, `06_home_upcoming_variants.html`, `00_prototype.html`

**別ブランチ待ち**
- `frontend/src/components/layout/mastery-progress.tsx` — `main` に存在しない（`feature/mastery-progress` の未マージ分）。Task 9 で扱う。

---

### Task 1: 新トークンを併存で追加する

旧トークンを消さずに新トークンを足すだけのタスク。この時点では見た目は一切変わらない。以降のタスクが安全に段階移行できる土台になる。

**Files:**
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: なし
- Produces: Tailwind ユーティリティ `*-ink` `*-ink-md` `*-ink-lt` `*-primary` `*-primary-dk` `*-primary-br` `*-primary-lt` `*-late` `*-late-lt` `*-late-md` `*-red` `*-red-lt` `*-green` `*-green-lt` `*-mint` `*-line`。既存の `*-border` `*-bg` `*-surface` `*-text` `*-muted` は名前を維持したまま値のみ後で変わる。

- [ ] **Step 1: `@theme` に新トークンを追加する**

`frontend/src/app/globals.css` の `@theme` ブロック内、既存の `--color-navy` 群の**直前**に以下を挿入する。既存の行は削除しない。

```css
  /* --- New palette (2026-08-09 color overhaul). 旧 navy/amber 系は移行後に削除する --- */
  --color-ink:        #13294B;
  --color-ink-md:     #33517E;
  --color-ink-lt:     #EDF2F9;

  --color-primary:    #1668C4;
  --color-primary-dk: #114F98;
  --color-primary-br: #4FA3F7;  /* ink 面専用。白地では 2.6:1 */
  --color-primary-lt: #EAF3FE;

  --color-late:       #E0A32E;  /* 塗り専用。文字色に使わない */
  --color-late-lt:    #FFF6E0;
  --color-late-md:    #FBEDCE;

  --color-red-lt:     #FCEBEA;
  --color-mint:       #3FD6A8;  /* ink 面専用 */
  --color-line:       #B9C6D9;
```

- [ ] **Step 2: 新トークンが Tailwind に認識されることを確認する**

Run: `cd frontend && npm run build`
Expected: ビルド成功。`@theme` の構文エラーが出ないこと。

- [ ] **Step 3: 生成されるユーティリティを実際に確かめる**

**Tailwind v4 は、どのユーティリティからも参照されていない `@theme` トークンを出力から削り落とす。** そのため「トークンを足しただけ」ではCSS出力に現れない。実際に使う側を一時的に書いて確認する。

`frontend/src/app/layout.tsx` の `<body>` の className の末尾に一時的に `border-primary bg-late-lt text-mint border-line` を足す。

Run: `cd frontend && rm -rf .next && npm run build >/dev/null 2>&1 && grep -rhoiE -- '--color-(primary|late-lt|mint|line):[^;]*' .next/static/chunks/*.css | sort -u`
Expected: 4行が出る。
```
--color-late-lt:#fff6e0
--color-line:#b9c6d9
--color-mint:#3fd6a8
--color-primary:#1668c4
```

注意点が3つある。(1) 出力先は `.next/static/css/` ではなく `.next/static/chunks/`。(2) Tailwind v4 は hex を**小文字**で出力するため grep は大文字小文字を無視する必要がある。(3) `.next/dev/` 以下には開発サーバの古い成果物が残っていることがあり、それを掴むと確認にならない。だから先に `rm -rf .next` する。

確認できたら一時的に足した4クラスを削除して元に戻す。`git diff frontend/src/app/layout.tsx` が空になることまで確かめる。

- [ ] **Step 4: lint を通す**

Run: `cd frontend && npm run lint`
Expected: エラーなし

- [ ] **Step 5: コミット**

```bash
git add frontend/src/app/globals.css
git commit -m "style: add the new blue-based color tokens alongside the old ones"
```

---

### Task 2: レイアウトとナビゲーションを移行する

サイドバー・下部ナビ・認証カードのロゴ。`amber-br` は ink 面上のアクセントという役割がそのまま `primary-br` に対応するため、意味の振り分けが不要な最も単純なグループ。ここから始めて移行手順を固める。

**Files:**
- Modify: `frontend/src/components/layout/sidebar.tsx:14,30`
- Modify: `frontend/src/components/layout/bottom-nav.tsx:11,21`
- Modify: `frontend/src/components/auth/auth-card.tsx:12`

**Interfaces:**
- Consumes: Task 1 のトークン
- Produces: なし（見た目のみ）

- [ ] **Step 1: `sidebar.tsx` を書き換える**

`bg-navy` → `bg-ink`、ロゴの `text-amber-br` → `text-primary-br`、アクティブ行の3クラスを差し替える。

```tsx
// L11: <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[260px] bg-navy">
<aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[260px] bg-ink">

// L14: mis<span className="text-amber-br">note</span>
mis<span className="text-primary-br">note</span>

// L30: ? "bg-amber-br/20 text-white border-l-[3px] border-amber-br pl-[13px] pr-[16px]"
? "bg-primary-br/20 text-white border-l-[3px] border-primary-br pl-[13px] pr-[16px]"
```

- [ ] **Step 2: `bottom-nav.tsx` を書き換える**

```tsx
// L11: <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 flex">
<nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-ink border-t border-white/10 flex">

// L21: isActive ? "text-amber-br" : "text-white/70 hover:text-white",
isActive ? "text-primary-br" : "text-white/70 hover:text-white",
```

- [ ] **Step 3: `auth-card.tsx` のロゴを書き換える**

ログイン/サインアップ画面のロゴは**白地**に置かれるため、`primary-br` ではなく `primary` を使う（`primary-br` は白地で 2.6:1）。

```tsx
// L12: mis<span className="text-amber">note</span>
mis<span className="text-primary">note</span>
```

- [ ] **Step 4: 旧トークンが残っていないことを確認する**

Run: `cd frontend/src && grep -nE '(navy|amber)' components/layout/sidebar.tsx components/layout/bottom-nav.tsx components/auth/auth-card.tsx`
Expected: 出力なし（終了コード1）

- [ ] **Step 5: ビルドと lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: どちらもエラーなし

- [ ] **Step 6: 目視確認**

`npm run dev` で `/login`（ロゴが青）と、ログイン後の任意の画面（サイドバーが濃紺、アクティブ行が明るい青）を確認する。`docs/design/mockups/01_home_blue.html` のサイドバーと見比べる。

- [ ] **Step 7: コミット**

```bash
git add frontend/src/components/layout/sidebar.tsx frontend/src/components/layout/bottom-nav.tsx frontend/src/components/auth/auth-card.tsx
git commit -m "style: move the sidebar, bottom nav, and auth logo to the blue tokens"
```

---

### Task 3: ホーム画面を移行する

サマリーカードの構造変更と、遅延行の表現変更（本計画で最も設計判断が濃い部分）を含む。

**Files:**
- Modify: `frontend/src/components/home/summary-cards.tsx`
- Modify: `frontend/src/components/home/review-item.tsx:58,73,81,97`
- Modify: `frontend/src/components/home/upcoming-item.tsx:38,45,72`
- Modify: `frontend/src/components/home/page-header.tsx:44`
- Modify: `frontend/src/components/home/empty-state.tsx:34`
- Modify: `frontend/src/components/home/review-list.tsx`, `sub-header.tsx`, `home-content.tsx`

**Interfaces:**
- Consumes: Task 1 のトークン
- Produces: `summary-cards.tsx` の `StatCardProps.accent` の型が `"amber" | "green"` から `"green"` のみに変わる。呼び出し側は同ファイル内の `SummaryCards` だけなので外部への影響はない。

- [ ] **Step 1: `summary-cards.tsx` の `StatCard` から上罫を削除し、数字の色を2極にする**

上罫は数字の色と同じ情報を二重に持つため廃止する。色は青＝未克服（Today・苦手問題）、緑＝克服済みの2つだけ。

```tsx
type StatCardProps = {
  label: string;
  value: number;
  sub: string;
  accent?: "green";
};

function StatCard({ label, value, sub, accent }: StatCardProps) {
  // 青＝未克服、緑＝克服済み。Today は苦手問題の部分集合なので同じ青を持つ
  const valueColor = accent === "green" ? "text-green" : "text-primary";

  return (
    <div className="flex-1 bg-surface px-3.5 py-[18px] sm:px-6">
      <p className="text-[11px] text-muted font-bold tracking-[0.08em] uppercase mb-1.5">
        {label}
      </p>
      <p className={`font-serif text-[32px] font-bold leading-none tabular-nums ${valueColor}`}>
        {value}
      </p>
      <p className="text-[12px] text-muted mt-1">{sub}</p>
    </div>
  );
}
```

- [ ] **Step 2: `summary-cards.tsx` の `SummaryCards` から `accent="amber"` を外す**

```tsx
export default function SummaryCards({ todayCount, activeCount, masteredCount }: Props) {
  return (
    <div className="flex gap-px bg-border border border-border rounded-lg overflow-hidden shadow-sm">
      <StatCard label="Today" value={todayCount} sub="今日やる問題" />
      <StatCard label="苦手問題" value={activeCount} sub="復習中の問題" />
      <StatCard label="克服済み" value={masteredCount} sub="克服した問題" accent="green" />
    </div>
  );
}
```

- [ ] **Step 3: `review-item.tsx` の遅延表現を差し替える**

遅延は「地＋左帯＋バッジ」で示し、問題文の色は変えない。左帯は `border-b` と干渉しないよう inset box-shadow で描く。

```tsx
// L56-60 の三項演算子
isOverdue
  ? "bg-late-lt hover:bg-late-md shadow-[inset_3px_0_0_var(--color-late)]"
  : "hover:bg-ink-lt active:bg-ink-lt",

// L73: 遅延バッジ。金地に白文字は 2.2:1 なので ink 文字にする
<span className="inline-flex items-center gap-1 bg-late text-ink text-[10px] font-bold tracking-[0.04em] px-1.5 py-px rounded ml-2">

// L79-82: 遅延時に問題文を染めるのをやめる
<p className="text-[15px] font-medium leading-relaxed text-text">
  {item.questionBody}
</p>
```

`isOverdue` は L73 のバッジ表示条件でまだ使うため、変数自体は残す。

- [ ] **Step 4: `review-item.tsx` のホバー矢印を青にする**

```tsx
// L97
className="hidden sm:block text-muted/60 group-hover:text-primary group-hover:translate-x-0.5 transition-[color,transform] duration-150"
```

- [ ] **Step 5: `upcoming-item.tsx` を書き換える**

「未設定」は遅れではなく「まだ決めていない」なので金を使わず、操作を促す青にする。

```tsx
// L38: hover:bg-navy-lt active:bg-navy-lt
"rounded-md transition-colors duration-150 hover:bg-ink-lt active:bg-ink-lt",

// L45: isUnscheduled ? "text-amber" : "text-navy-md",
isUnscheduled ? "text-primary" : "text-ink-md",

// L72
className="hidden sm:block ml-1 text-muted/60 group-hover:text-primary group-hover:translate-x-0.5 transition-[color,transform] duration-150"
```

- [ ] **Step 6: `page-header.tsx` と `empty-state.tsx` の CTA を青にする**

```tsx
// page-header.tsx L44
className="flex items-center gap-2 bg-primary text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-primary-dk transition-colors duration-150"

// home/empty-state.tsx L34
className="inline-flex items-center gap-2 bg-primary text-white rounded-md px-6 py-3 text-[15px] font-bold hover:bg-primary-dk transition-colors duration-150"
```

- [ ] **Step 7: `home-content.tsx` のエラー表示を新トークンに揃える**

Tailwind 既定の `red-200 / red-50 / red-700` を使っていた箇所を独自トークンに置き換える。

```tsx
// L115-118
<div
  role="alert"
  className="mb-5 rounded-md border border-red bg-red-lt px-4 py-3 text-[13px] text-red"
>
```

スケルトンの `bg-navy-lt` は `bg-ink-lt` に置き換える（L91-93, L99, L101 の計5箇所。L101 は `bg-ink-lt/70`）。

- [ ] **Step 8: `review-list.tsx` と `sub-header.tsx` の残りを置き換える**

Run: `cd frontend/src && grep -nE '(navy|amber)' components/home/review-list.tsx components/home/sub-header.tsx`

出力された各行について `navy` → `ink`、`navy-md` → `ink-md`、`navy-lt` → `ink-lt` に置き換える（この2ファイルに amber は無い）。

- [ ] **Step 9: ホーム画面から旧トークンが消えたことを確認する**

Run: `cd frontend/src && grep -rnE '(navy|amber)|#(CBD5E1|E8EEF7|FFF3CC|FFFBEB)|red-(50|200|700)' components/home/`
Expected: 出力なし（終了コード1）

- [ ] **Step 10: ビルドと lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: どちらもエラーなし

- [ ] **Step 11: 目視確認**

`npm run dev` でホーム画面を開き、`docs/design/mockups/01_home_blue.html` と並べて比較する。確認項目:
- 3つの数字が 青 / 青 / 緑 で、上の3px罫が無いこと
- 遅延行が薄い金地＋左に金の帯＋金地に濃紺のバッジで、**問題文は通常の文字色**であること
- 「問題を登録」ボタンが青

- [ ] **Step 12: コミット**

```bash
git add frontend/src/components/home/
git commit -m "style: move the home screen to the blue tokens and rework the overdue row"
```

---

### Task 4: 苦手問題一覧を移行する

**Files:**
- Modify: `frontend/src/components/mistakes/mistake-row.tsx`
- Modify: `frontend/src/components/mistakes/mistake-tabs.tsx:36,44`
- Modify: `frontend/src/components/mistakes/mistakes-content.tsx`, `empty-state.tsx`, `tag-filter.tsx:73-74`
- Modify: `frontend/src/components/reason-tag/tag-badge.tsx`, `tag-picker.tsx:29`

**Interfaces:**
- Consumes: Task 1 のトークン、Task 3 で確定した遅延表現
- Produces: なし

- [ ] **Step 1: `mistake-row.tsx` の遅延表現を `review-item.tsx` と揃える**

```tsx
// L59: isOverdue ? "bg-amber-lt" : "",
isOverdue ? "bg-late-lt shadow-[inset_3px_0_0_var(--color-late)]" : "",

// L62-63 のホバー
? "hover:bg-late-md"
: "hover:bg-ink-lt"

// L95: 遅延バッジ
<span className="inline-flex items-center gap-1 bg-late text-ink text-[10px] font-bold tracking-[0.04em] px-1.5 py-px rounded ml-2">

// L104: 遅延時に問題文を染めるのをやめる
"text-text",

// L133: 遅延日付。文字は染めず太字だけ残す
? "text-text font-bold"

// L136: 未設定の日付
: "text-line",
```

- [ ] **Step 2: `mistake-row.tsx` の残りのボタンを置き換える**

```tsx
// L157, L173 の副次ボタン（2箇所とも同じ文字列）
className="px-3 py-1.5 rounded-[5px] border border-border bg-surface text-[12px] text-muted whitespace-nowrap hover:bg-ink-lt hover:border-line hover:text-ink disabled:opacity-50 transition-colors duration-150"

// L163 の主ボタン
className="px-3.5 py-1.5 rounded-[5px] bg-primary text-white text-[12px] font-bold whitespace-nowrap hover:bg-primary-dk transition-colors duration-150"
```

- [ ] **Step 3: `mistake-tabs.tsx` を書き換える**

選択中のタブは「いま見ているもの」なので青。

```tsx
// L36: ? "text-navy font-bold border-amber"
? "text-ink font-bold border-primary"

// L44: selected ? "bg-amber-lt text-amber" : "bg-navy-lt text-muted",
selected ? "bg-primary-lt text-primary" : "bg-ink-lt text-muted",
```

- [ ] **Step 4: `tag-filter.tsx` と `tag-picker.tsx` の選択チップを書き換える**

両ファイルとも同じ2行構造を持つ（`tag-filter.tsx:73-74`、`tag-picker.tsx:28-29`）。

```tsx
? "border-primary bg-primary font-bold text-white"
: "border-border bg-surface text-muted hover:border-line hover:bg-ink-lt hover:text-ink",
```

- [ ] **Step 5: `tag-badge.tsx` を書き換える**

```tsx
className="inline-flex items-center rounded bg-ink-lt px-1.5 py-px text-[10px] font-bold tracking-[0.04em] text-ink-md normal-case"
```

- [ ] **Step 6: `mistakes-content.tsx` と `empty-state.tsx` の残りを置き換える**

Run: `cd frontend/src && grep -nE '(navy|amber)' components/mistakes/mistakes-content.tsx components/mistakes/empty-state.tsx`
Expected: `mistakes-content.tsx` から1行（`navy` のみ）、`empty-state.tsx` から2行（`navy` 1・`amber` 1）

`empty-state.tsx` の `bg-amber` / `hover:bg-amber-dk`（登録へ誘導する CTA）を `bg-primary` / `hover:bg-primary-dk` に、両ファイルの `navy` 系を `ink` 系に置き換える。

- [ ] **Step 7: 旧トークンが消えたことを確認する**

Run: `cd frontend/src && grep -rnE '(navy|amber)|#(CBD5E1|E8EEF7|FFF3CC|FFFBEB)' components/mistakes/ components/reason-tag/`
Expected: 出力なし（終了コード1）

- [ ] **Step 8: ビルドと lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: どちらもエラーなし

- [ ] **Step 9: 目視確認**

`/mistakes` を開き、遅延行がホームと同じ見え方（金地＋左帯＋バッジ、問題文は通常色）になっていること、タブの選択状態が青になっていることを確認する。

- [ ] **Step 10: コミット**

```bash
git add frontend/src/components/mistakes/ frontend/src/components/reason-tag/
git commit -m "style: move the mistake list to the blue tokens"
```

---

### Task 5: 復習フローを移行する

不正解フェーズのパネルを amber 枠から赤枠に変える。正解フェーズが緑枠なので、対になる。

**Files:**
- Modify: `frontend/src/components/review/judge-panel.tsx`
- Modify: `frontend/src/components/review/review-flow.tsx`, `question-card.tsx`
- Modify: `frontend/src/components/review-date/date-chip.tsx:22-23`

**Interfaces:**
- Consumes: Task 1 のトークン
- Produces: なし

- [ ] **Step 1: `judge-panel.tsx` の不正解（メモ更新）パネルを赤にする**

```tsx
// L187: <div className="border border-amber rounded-lg overflow-hidden">
<div className="border border-red rounded-lg overflow-hidden">

// L188: <div className="bg-amber px-5 py-3 flex items-center gap-2">
<div className="bg-red px-5 py-3 flex items-center gap-2">

// L197: <div className="bg-amber-lt px-5 sm:px-6 py-5 flex flex-col gap-4">
<div className="bg-red-lt px-5 sm:px-6 py-5 flex flex-col gap-4">
```

ヘッダー内の文字は既に `text-white`。赤 `#C0242A` に白文字で 5.9:1 なので変更不要。

- [ ] **Step 2: `judge-panel.tsx` の保存ボタンを青にする**

Run: `cd frontend/src && grep -n 'amber' components/review/judge-panel.tsx`

残る `bg-amber` / `hover:bg-amber-dk`（保存ボタン）を `bg-primary` / `hover:bg-primary-dk` に置き換える。正解/不正解ボタンの `bg-green` `bg-red` は名前が変わらないため触らない（値だけ Task 7 で新しくなる）。

- [ ] **Step 3: `review-flow.tsx` を書き換える**

```tsx
// L137: 戻るボタン
className="flex items-center justify-center text-primary rounded-md p-2.5 -ml-2.5 transition-colors hover:bg-primary-lt"

// L210, L219: 区切り記号
<span className="text-line" aria-hidden="true">

// L251: 次へ進むボタン
className="w-full py-4 rounded-lg bg-ink-lt border border-dashed border-line text-[14px] font-bold text-muted tracking-[0.02em] hover:bg-primary-lt hover:border-primary hover:text-primary transition-colors duration-150"
```

L251 のホバーは元は `#E8EEF7` / `border-navy` / `text-navy` だった。青のトークンに寄せることで、押せるものは青という規則に揃う。

- [ ] **Step 4: `review-flow.tsx` の残りを置き換える**

Run: `cd frontend/src && grep -n -E '(navy|amber)' components/review/review-flow.tsx`
Expected: Step 3 で直した分を除き、`navy` 系の残りと `bg-amber` / `hover:bg-amber-dk` を含む1行

出力された各行を `ink` 系に置き換える。`bg-amber` / `hover:bg-amber-dk`（次の問題へ進む主ボタン）は `primary` 系にする。

- [ ] **Step 5: `question-card.tsx` を書き換える**

```tsx
// L34: <div className="text-[13px] text-[#CBD5E1]">
<div className="text-[13px] text-line">
```

Run: `cd frontend/src && grep -n -E '(navy|amber)' components/review/question-card.tsx`

出力された各行を `ink` 系に置き換える。

- [ ] **Step 6: `date-chip.tsx` を書き換える**

```tsx
// L22-23
? "border-primary bg-primary font-bold text-white"
: "border-border bg-surface text-muted hover:border-line hover:bg-ink-lt hover:text-ink",
```

- [ ] **Step 7: 旧トークンが消えたことを確認する**

Run: `cd frontend/src && grep -rnE '(navy|amber)|#(CBD5E1|E8EEF7|FFF3CC|FFFBEB)' components/review/ components/review-date/`
Expected: 出力なし（終了コード1）

- [ ] **Step 8: ビルドと lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: どちらもエラーなし

- [ ] **Step 9: 目視確認**

`npm run dev` で問題を1問復習し、3フェーズすべてを確認する。
- 判定前: 「正解」が緑、「不正解」が赤で、**視覚的な強さが釣り合っている**こと（旧配色では不正解のほうが強かった）
- 正解後: 緑枠のパネル
- 不正解後: 赤枠のパネル（旧: amber枠）

- [ ] **Step 10: コミット**

```bash
git add frontend/src/components/review/ frontend/src/components/review-date/
git commit -m "style: move the review flow to the blue tokens and make the wrong-answer panel red"
```

---

### Task 6: フォーム・認証・科目管理・クイック保存を移行する

残りの全ファイル。エラー表示を金から赤に統一する。

**Files:**
- Modify: `frontend/src/lib/form-styles.ts`
- Modify: `frontend/src/components/auth/login-form.tsx:45,81,87`, `signup-form.tsx:55,107,113`
- Modify: `frontend/src/components/account/account-panel.tsx:36,59`
- Modify: `frontend/src/components/register/register-form.tsx`
- Modify: `frontend/src/components/subjects/subjects-manager.tsx`
- Modify: `frontend/src/components/quick/quick-content.tsx:61`, `draft-row.tsx`, `empty-state.tsx`, `quick-save-modal.tsx`
- Modify: `frontend/src/app/layout.tsx`

**Interfaces:**
- Consumes: Task 1 のトークン
- Produces: なし

- [ ] **Step 1: `form-styles.ts` のフォーカス表現を青にする**

```ts
export const inputBase =
  "w-full border border-border rounded-md px-3 py-2.5 text-[14px] bg-white text-text transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-lt)]";

export const labelBase =
  "flex items-center text-[12px] font-bold text-ink-md tracking-[0.05em] mb-1.5";
```

- [ ] **Step 2: `login-form.tsx` と `signup-form.tsx` のエラーボックスを赤にする**

両ファイルとも同じ文字列（`login-form.tsx:45`、`signup-form.tsx:55`）。

```tsx
className="bg-red-lt border border-red text-red text-[13px] rounded-md px-3 py-2.5"
```

- [ ] **Step 3: `login-form.tsx` と `signup-form.tsx` の送信ボタンとリンクを青にする**

```tsx
// login-form.tsx:81 / signup-form.tsx:107
className="w-full rounded-md bg-primary py-2.5 text-[14px] font-bold text-white transition-colors duration-150 hover:bg-primary-dk disabled:opacity-50"

// login-form.tsx:87 / signup-form.tsx:113
className="font-bold text-primary hover:underline"
```

- [ ] **Step 4: `account-panel.tsx` を書き換える**

```tsx
// L36: エラー表示
<p className="mb-5 bg-red-lt border border-red text-red text-[13px] rounded-md px-3 py-2.5">

// L59: ログアウトボタン
className="mt-6 px-4 py-2.5 rounded-md border border-border bg-surface text-[13px] font-bold text-muted transition-colors duration-150 hover:bg-ink-lt hover:border-line hover:text-ink"
```

- [ ] **Step 5: `register-form.tsx` を書き換える**

```tsx
// L156: 戻るボタン
className="flex items-center justify-center text-primary rounded-md p-2.5 -ml-2.5 transition-colors hover:bg-primary-lt"

// L348: キャンセルボタン
className="bg-white text-muted border border-border rounded-md px-5 py-3 text-[13px] transition-colors hover:bg-ink-lt hover:border-line hover:text-text"
```

Run: `cd frontend/src && grep -n -E '(navy|amber)' components/register/register-form.tsx`

残った `bg-amber` / `hover:bg-amber-dk`（送信ボタン）を `primary` 系に、`navy` 系を `ink` 系に置き換える。

- [ ] **Step 6: `subjects-manager.tsx` を書き換える**

このファイルは26箇所と最多。まず共通の入力スタイル（L11）を直す。

```ts
"border border-border rounded-md px-3 py-2 text-[13px] bg-white text-text focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-lt)]"
```

```tsx
// L413: 空欄のダッシュ
<span className="text-[12px] text-line">—</span>

// L482: 単元追加ボタン
className="w-full flex items-center gap-1.5 px-4 py-2.5 pl-7 text-[12px] font-bold text-primary border-t border-border hover:bg-primary-lt ..."
```

Run: `cd frontend/src && grep -n -E '(navy|amber)|#CBD5E1' components/subjects/subjects-manager.tsx`

残る各行を置き換える。`bg-amber` / `bg-amber-dk` の6組はすべて操作ボタンなので `bg-primary` / `bg-primary-dk`。`navy` 系は `ink` 系、`#CBD5E1` は `line`。

- [ ] **Step 7: `quick/` の4ファイルを書き換える**

Run: `cd frontend/src && grep -n -E '(navy|amber)' components/quick/*.tsx`

`bg-amber` / `hover:bg-amber-dk` はすべて保存・作成ボタンなので `primary` 系、`navy` 系は `ink` 系に置き換える。

- [ ] **Step 8: `app/layout.tsx` を確認する**

`bg-bg text-text font-sans antialiased` はトークン名が変わらないため変更不要。念のため確認する。

Run: `cd frontend/src && grep -n -E '(navy|amber)' app/layout.tsx`
Expected: 出力なし

- [ ] **Step 9: 全ファイルから旧トークンが消えたことを確認する**

Run: `cd frontend/src && grep -rnE '(navy|amber)|#(CBD5E1|E8EEF7|FFF3CC|FFFBEB)' --include='*.tsx' --include='*.ts' . | grep -v generated`
Expected: 出力なし（終了コード1）

- [ ] **Step 10: ビルドと lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: どちらもエラーなし

- [ ] **Step 11: 目視確認**

`/login`（わざと誤ったパスワードでエラーボックスが赤くなること）、`/register`、`/subjects`、`/quick`、`/account` を開いて確認する。

- [ ] **Step 12: コミット**

```bash
git add frontend/src/lib/form-styles.ts frontend/src/components/auth/ frontend/src/components/account/ frontend/src/components/register/ frontend/src/components/subjects/ frontend/src/components/quick/
git commit -m "style: move the forms, auth, subjects, and quick save to the blue tokens"
```

---

### Task 7: 旧トークンを削除し、新しい値を確定する

ここで初めて `bg` / `text` / `muted` / `border` の**値**が変わり、画面全体の地の色が動く。

**Files:**
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: Task 2〜6 の移行完了
- Produces: 最終的なトークン一覧

- [ ] **Step 1: 旧トークンを削除し、共通トークンの値を差し替える**

`@theme` ブロックを以下の内容で置き換える（`--font-*` の2行は既存のまま残す）。

```css
@theme {
  /* --- Color tokens (2026-08-09 color overhaul) --- */
  /* 面 */
  --color-ink:        #13294B;
  --color-ink-md:     #33517E;
  --color-ink-lt:     #EDF2F9;

  /* 未克服・主要アクション */
  --color-primary:    #1668C4;
  --color-primary-dk: #114F98;
  --color-primary-br: #4FA3F7;  /* ink 面専用。白地では 2.6:1 */
  --color-primary-lt: #EAF3FE;

  /* 復習が遅れている。塗り専用で、文字色には使わない（白地・白文字とも 2.2:1） */
  --color-late:       #E0A32E;
  --color-late-lt:    #FFF6E0;
  --color-late-md:    #FBEDCE;

  /* 間違い・不正解・エラー */
  --color-red:        #C0242A;
  --color-red-lt:     #FCEBEA;

  /* 克服済み・正解 */
  --color-green:      #0A7A5A;
  --color-green-lt:   #E7F7F1;
  --color-mint:       #3FD6A8;  /* ink 面専用 */

  /* 地・線・文字 */
  --color-bg:         #F5F8FC;
  --color-surface:    #FFFFFF;
  --color-border:     #DCE4EF;
  --color-line:       #B9C6D9;
  --color-text:       #0E1E33;
  --color-muted:      #5B6B85;

  /* --- Fonts --- */
  --font-sans:  var(--font-noto-sans);
  --font-serif: var(--font-noto-serif);
}
```

- [ ] **Step 2: フォーカスリングと `body` の直書きを新しい値に合わせる**

```css
/* Focus ring (WCAG AA) */
*:focus-visible {
  outline: 2px solid #1668C4;
  outline-offset: 2px;
  border-radius: 4px;
}
```

```css
body {
  background-color: #F5F8FC;
  color: #0E1E33;
  font-size: 16px;
}
```

- [ ] **Step 3: 旧トークンの定義も参照も残っていないことを確認する**

Run: `cd frontend/src && grep -rnE 'navy|amber' --include='*.tsx' --include='*.ts' --include='*.css' . | grep -v generated`
Expected: 出力なし（終了コード1）

- [ ] **Step 4: ハードコードされた色が残っていないことを確認する**

Run: `cd frontend/src && grep -rnoE '#[0-9A-Fa-f]{6}' --include='*.tsx' --include='*.ts' . | grep -v generated`
Expected: 出力なし（終了コード1）。`globals.css` の3箇所（focus ring と body の2つ）だけは意図的に残る。

- [ ] **Step 4b: 生の Tailwind 既製クラスが残っていないことを確認する**

**この刷新の目的は「既製 swatch の寄せ集めをやめる」ことなので、`bg-red-50` のような番号付きクラスが残っていたら目的を達していない。** 独自トークンは番号を持たない（`bg-red` / `bg-red-lt` / `text-line`）。旧トークン名 (`navy` / `amber`) を探す grep ではこれを捕まえられない。実際 Task 4・5・6 はこの見落としを全部素通りさせ、7ファイル9箇所が生き残った。

Run:
```
cd frontend/src && grep -rnE '\b(bg|text|border)-(red|green|blue|slate|gray|amber|yellow|orange|emerald)-[0-9]{2,3}\b' --include='*.tsx' --include='*.ts' . | grep -v generated
```
Expected: 出力なし（終了コード1）

- [ ] **Step 5: ビルドと lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: どちらもエラーなし

- [ ] **Step 6: 全画面の目視確認**

`npm run dev` で7画面すべてを開く: `/`, `/register`, `/mistakes`, `/review/[id]`, `/subjects`, `/quick`, `/account`, `/login`, `/signup`。地の色がごく淡い青になり、白いカードが浮いて見えることを確認する。

- [ ] **Step 7: コミット**

```bash
git add frontend/src/app/globals.css
git commit -m "style: drop the old slate/amber tokens and switch to the new palette values"
```

---

### Task 8: 設計ドキュメントと残りのモックアップを更新する

`docs/design/screens/common-ui.md` は「モックアップの `:root` が正」と書いているため、モックアップを更新しないとドキュメントが嘘になる。

**Files:**
- Modify: `docs/design/screens/common-ui.md`
- Modify: `docs/design/mockups/02_register.html`, `03_mistake_list.html`, `04_subjects.html`, `05_review.html`, `06_home_upcoming_variants.html`, `00_prototype.html`

**Interfaces:**
- Consumes: Task 7 で確定したトークン
- Produces: なし

- [ ] **Step 1: `common-ui.md` のカラー節を書き換える**

`## カラー・アクセシビリティ` 節の冒頭3つの箇条書きを以下に差し替える。

```markdown
- カラートークン（モックアップの `:root` が正。設計の根拠は [配色刷新の設計](../../superpowers/specs/2026-08-09-color-palette-design.md)）:
  - `--primary: #1668C4` — 未克服・主要ボタン・リンク（白地 5.5:1）
  - `--primary-dk: #114F98` — ホバー時
  - `--primary-br: #4FA3F7` — ink サイドバー上のアクセント専用（ロゴ・アクティブ表示）。**白背景上のテキスト・ボタンには使わない**（2.6:1 でWCAG AA未達）
  - `--late: #E0A32E` — 復習が遅れている表示専用。**塗りにのみ使い、文字色にはしない**（白地・白文字とも 2.2:1）。金地に載せる文字は `--ink`
  - `--green: #0A7A5A` / `--mint: #3FD6A8` — 克服済み・正解。`--mint` は ink 面専用
  - `--red: #C0242A` — 間違えた回数・不正解・エラー表示
- 色の意味は4つに限る: 青＝未克服/行動、緑＝克服済み、金＝遅れ、赤＝間違い/エラー
```

- [ ] **Step 2: モックアップの一括更新は行わない（2026-08-09 に決定）**

当初は `02`〜`06` と `00_prototype.html` の `:root` を差し替える予定だったが、**やらないことにした。** モックアップは実装前の設計資料であり、実装が完了したいまは `frontend/` のコード自体が正になる。旧配色のまま残る資料を追いかけて塗り直す価値は薄い。

代わりに `common-ui.md` 側で2点を明示する。

- カラートークンの正は `frontend/src/app/globals.css` の `@theme`（モックアップではない）
- `01_home_blue.html` 以外のモックアップは旧配色のままなので、配色の参照に使わない

`01_home.html` と `01_home_blue.html` はどちらも残す。前者は旧配色との比較材料、後者は新配色の見た目の参照。

- [ ] **Step 3: コミット**

```bash
git add docs/design/screens/common-ui.md
git commit -m "docs: update the color tokens in common-ui"
```

---

### Task 9: `feature/mastery-progress` 合流時の追随（条件付き）

**このタスクは `feature/mastery-progress` が `main` にマージされた後に実行する。** `mastery-progress.tsx` は `main` に存在しないため、Task 1〜8 では触れられない。放置すると、マージ後にバーの背景色が消えたまま気づかれない。

**Files:**
- Modify: `frontend/src/components/layout/mastery-progress.tsx`

**Interfaces:**
- Consumes: Task 7 の最終トークン
- Produces: なし

- [ ] **Step 1: マージ後に旧トークンが持ち込まれていないか確認する**

Run: `cd frontend/src && grep -rnE 'navy|amber' --include='*.tsx' . | grep -v generated`
Expected: `components/layout/mastery-progress.tsx` の `bg-amber-br` が1件出る

- [ ] **Step 2: 克服率バーの色を差し替える**

伸びた部分＝克服済み（ミント）、溝＝未克服（青）。サマリーカードの青と緑がそのままバーの意味になる。

```tsx
// 溝
className="mb-1.5 h-[5px] rounded-full bg-primary-br/28"

// 伸びた部分
className="h-[5px] rounded-full bg-mint"
```

- [ ] **Step 3: 旧トークンが消えたことを確認する**

Run: `cd frontend/src && grep -rnE 'navy|amber' --include='*.tsx' . | grep -v generated`
Expected: 出力なし（終了コード1）

- [ ] **Step 4: ビルドと lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: どちらもエラーなし

- [ ] **Step 5: 目視確認**

1024px 以上の幅でサイドバー最下部を確認する。溝が青、伸びた部分がミントで、`01_home_blue.html` のバーと一致すること。

- [ ] **Step 6: コミット**

```bash
git add frontend/src/components/layout/mastery-progress.tsx
git commit -m "style: move the mastery rate bar to the blue tokens"
```
