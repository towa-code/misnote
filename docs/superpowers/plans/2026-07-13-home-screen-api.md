# ホーム画面の実API接続 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `frontend/src/app/page.tsx` のモックデータ（`MOCK_TODAY_ITEMS`等）を廃止し、ホーム画面を実バックエンドAPI（`/v1/mistake-notes/*`）に接続する。復習日未設定の問題には、その場で復習日を設定できる日付入力を追加する。

**Architecture:** `register`/`subjects` 画面と同じパターン。`page.tsx`はサーバーコンポーネントのまま`<HomePageHeader />`と新規クライアントコンポーネント`<HomeContent />`を返すだけにする。データ取得・状態管理・イベント処理は`HomeContent`に集約し、既存の`SummaryCards`/`ReviewList`/`EmptyState`/`ReviewItem`/`UpcomingItem`はそのまま再利用する（`UpcomingItem`のみ復習日設定用に拡張）。

**Tech Stack:** Next.js 16 (App Router, Client Components) / openapi-generator製TypeScriptクライアント（`frontend/src/generated/`）/ Tailwind CSS。

**設計書:** `docs/superpowers/specs/2026-07-13-home-screen-api-design.md`

## Global Constraints

- 手書きfetch禁止。API呼び出しは全て`frontend/src/generated/`の生成クライアント経由（`frontend/src/lib/api.ts`のインスタンスを使う）。
- データ更新後は「都度再取得」方式（楽観更新なし）。register/subjects画面と同じ規約。
- `/review/{id}`へのリンクはそのまま維持する（復習画面は別タスクで未実装、404は許容）。
- 復習日未設定行にのみ日付設定機能を追加する。「明日以降」行の日付変更、メモ/学んだこと編集、復習フロー本体、問題文の50文字省略表示は今回のスコープ外。
- 本リポジトリに自動テストフレームワークは存在しない（`backend/`にpytest設定なし、`frontend/`にテストランナーなし）。各タスクの検証は `npx tsc --noEmit` によるコンパイル確認と、Docker上の実バックエンドに対する`curl`/ブラウザでの手動確認で行う。

---

### Task 1: `mistakeNotesApi` を共有APIクライアントに追加

**Files:**
- Modify: `frontend/src/lib/api.ts`

**Interfaces:**
- Consumes: `MistakeNotesApi`（`@/generated`からexport済み。コンストラクタは既存の`config: Configuration`を受け取る）
- Produces: `mistakeNotesApi: MistakeNotesApi`（Task 3で`mistakeNotesApi.listTodayV1MistakeNotesTodayGet()`等として使用）

- [ ] **Step 1: `api.ts`を編集**

`frontend/src/lib/api.ts`の全文を以下に置き換える:

```ts
import {
  Configuration,
  SubjectsApi,
  UnitsApi,
  QuestionsApi,
  MistakeNotesApi,
} from "@/generated";

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
});

export const subjectsApi = new SubjectsApi(config);
export const unitsApi = new UnitsApi(config);
export const questionsApi = new QuestionsApi(config);
export const mistakeNotesApi = new MistakeNotesApi(config);
```

- [ ] **Step 2: 型チェック**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -i "lib/api.ts"`
Expected: 出力なし（このファイルに起因するエラーがないこと）

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: add mistakeNotesApi to shared API client"
```

---

### Task 2: `UpcomingItem`に復習日未設定行の日付設定機能を追加し、`ReviewList`から配線する

**Files:**
- Modify: `frontend/src/components/home/upcoming-item.tsx`
- Modify: `frontend/src/components/home/review-list.tsx`

**Interfaces:**
- Consumes: `ReviewItemData`（`@/components/home/review-item`、変更なし）、`XIcon`（同ファイルからexport済み）
- Produces: `UpcomingItem`の新props `onSetReviewDate?: (id: string, date: string) => void`。`date`は`"YYYY-MM-DD"`形式の文字列（`<input type="date">`の`value`そのまま）。Task 3の`HomeContent`がこの関数を実装して渡す。

**背景:** 現状`UpcomingItem`は行全体を`<Link href="/review/{id}">`でラップしている。復習日未設定行に`<input type="date">`を追加する際、アンカー内にinputを置くのはHTML的に不正かつクリック競合を起こすため、日付inputだけをLinkの外側に出す構造に変える。Linkは`display:contents`にして、中身（科目名・問題文・間違い回数）がそのまま親グリッドのセルとして振る舞うようにする。

- [ ] **Step 1: `upcoming-item.tsx`を編集**

`frontend/src/components/home/upcoming-item.tsx`の全文を以下に置き換える:

```tsx
"use client";

import Link from "next/link";
import { XIcon, type ReviewItemData } from "@/components/home/review-item";

// "明日" for tomorrow, "7/10（金）" for later dates, "未設定" when null
function formatUpcomingDate(isoDate: string | null): string {
  if (!isoDate) return "未設定";
  const date = new Date(isoDate);
  date.setHours(0, 0, 0, 0);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  if (date.getTime() === tomorrow.getTime()) return "明日";
  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

type Props = {
  item: ReviewItemData;
  onSetReviewDate?: (id: string, date: string) => void;
};

const rowGridClass =
  "grid items-center gap-5 px-2 py-3.5 border-b border-border last:border-b-0 grid-cols-[80px_1fr_60px] rounded-md transition-colors duration-150";

// Date-led, toned-down row for scheduled/unscheduled (non-today) notes
export default function UpcomingItem({ item, onSetReviewDate }: Props) {
  const isUnscheduled = item.nextReviewAt === null;

  const subjectAndQuestion = (
    <div>
      <div className="flex items-center text-[11px] font-bold text-muted tracking-[0.07em] uppercase mb-1 opacity-75">
        {item.subjectName}
        {item.unitName && (
          <>
            <span className="mx-1 opacity-40">›</span>
            {item.unitName}
          </>
        )}
      </div>
      <p className="text-[14px] text-muted leading-relaxed">
        {item.questionBody}
      </p>
    </div>
  );

  const wrongCount = (
    <span className="flex items-center justify-end gap-1 text-[12px] text-muted font-bold whitespace-nowrap">
      <XIcon />
      {item.wrongCount}
    </span>
  );

  // Unscheduled row with the ability to set a review date: the date input
  // must live outside the <Link> (an <input> inside an <a> is invalid HTML
  // and would fight the row-level click target), so the Link only wraps
  // the remaining cells via display:contents.
  if (isUnscheduled && onSetReviewDate) {
    return (
      <div className={rowGridClass}>
        <input
          type="date"
          aria-label="復習日を設定"
          className="text-[12px] text-amber font-bold bg-transparent border border-border rounded px-1.5 py-1 cursor-pointer focus:outline-none focus:border-amber"
          onChange={(e) => {
            if (e.target.value) onSetReviewDate(item.id, e.target.value);
          }}
        />
        <Link href={`/review/${item.id}`} className="contents">
          {subjectAndQuestion}
          {wrongCount}
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/review/${item.id}`}
      className={[rowGridClass, "hover:bg-navy-lt"].join(" ")}
    >
      <span
        className={[
          "text-[13px] font-bold whitespace-nowrap",
          isUnscheduled ? "text-amber" : "text-navy-md",
        ].join(" ")}
      >
        {formatUpcomingDate(item.nextReviewAt)}
      </span>
      {subjectAndQuestion}
      {wrongCount}
    </Link>
  );
}
```

- [ ] **Step 2: `review-list.tsx`を編集**

`frontend/src/components/home/review-list.tsx`の全文を以下に置き換える（`onSetReviewDate`propを追加し、復習日未設定セクションの`UpcomingItem`にのみ渡す）:

```tsx
import ReviewItem, { type ReviewItemData } from "@/components/home/review-item";
import UpcomingItem from "@/components/home/upcoming-item";
import SubHeader from "@/components/home/sub-header";

type Props = {
  todayItems: ReviewItemData[];
  futureItems: ReviewItemData[];
  unscheduledItems: ReviewItemData[];
  onSetReviewDate?: (id: string, date: string) => void;
};

export default function ReviewList({
  todayItems,
  futureItems,
  unscheduledItems,
  onSetReviewDate,
}: Props) {
  return (
    <section className="mt-8">
      {/* Today: main section with navy-underlined header */}
      {todayItems.length > 0 && (
        <>
          <div className="flex items-baseline gap-3 pb-2.5 mb-4 border-b-2 border-navy">
            <h2 className="font-serif text-[16px] font-bold tracking-[0.04em]">復習リスト</h2>
            <span className="text-[13px] text-muted">{todayItems.length}問</span>
          </div>
          <div>
            {todayItems.map((item) => (
              <ReviewItem key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* Upcoming: subordinate, date-led rows */}
      {futureItems.length > 0 && (
        <>
          <SubHeader label="明日以降の予定" count={futureItems.length} />
          <div>
            {futureItems.map((item) => (
              <UpcomingItem key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* Unscheduled: always at the very bottom */}
      {unscheduledItems.length > 0 && (
        <>
          <SubHeader label="復習日未設定" count={unscheduledItems.length} />
          <div>
            {unscheduledItems.map((item) => (
              <UpcomingItem
                key={item.id}
                item={item}
                onSetReviewDate={onSetReviewDate}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 3: 型チェック**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -i "components/home"`
Expected: 出力なし

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/home/upcoming-item.tsx frontend/src/components/home/review-list.tsx
git commit -m "feat: add inline review-date picker to unscheduled home rows"
```

---

### Task 3: `HomeContent`クライアントコンポーネントを作成（データ取得・状態管理）

**Files:**
- Create: `frontend/src/components/home/home-content.tsx`

**Interfaces:**
- Consumes:
  - `mistakeNotesApi`（Task 1、`@/lib/api`）: `listTodayV1MistakeNotesTodayGet(): Promise<MistakeNoteResponse[]>`, `listActiveV1MistakeNotesGet(): Promise<MistakeNoteResponse[]>`, `listMasteredV1MistakeNotesMasteredGet(): Promise<MistakeNoteResponse[]>`, `updateNoteV1MistakeNotesNoteIdPut({noteId: string, mistakeNoteUpdate: {nextReviewAt?: Date | null}}): Promise<MistakeNoteResponse>`
  - `MistakeNoteResponse`型（`@/generated`）: `{ id: string; question: { subject: {name: string}; unit: {name: string} | null; questionText: string }; wrongCount: number; nextReviewAt: Date | null; ... }`
  - `ReviewItemData`型（`@/components/home/review-item`、変更なし）
  - `SummaryCards`（`todayCount, activeCount, masteredCount: number`）、`ReviewList`（Task 2で`onSetReviewDate?`prop追加済み）、`EmptyState`（`variant: "no-notes" | "done-today"`）— いずれも既存のまま
- Produces: `HomeContent`（デフォルトexport、propなし）。Task 4の`page.tsx`がレンダリングする。

- [ ] **Step 1: `home-content.tsx`を新規作成**

```tsx
"use client";

import { useEffect, useState } from "react";
import SummaryCards from "@/components/home/summary-cards";
import ReviewList from "@/components/home/review-list";
import EmptyState from "@/components/home/empty-state";
import { type ReviewItemData } from "@/components/home/review-item";
import type { MistakeNoteResponse } from "@/generated";
import { mistakeNotesApi } from "@/lib/api";

function toReviewItem(note: MistakeNoteResponse): ReviewItemData {
  const nextReviewAt = note.nextReviewAt
    ? note.nextReviewAt.toISOString().slice(0, 10)
    : null;

  let overdueDays = 0;
  if (nextReviewAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDate = new Date(nextReviewAt);
    reviewDate.setHours(0, 0, 0, 0);
    overdueDays = Math.max(
      0,
      Math.round((today.getTime() - reviewDate.getTime()) / 86_400_000)
    );
  }

  return {
    id: note.id,
    subjectName: note.question.subject.name,
    unitName: note.question.unit?.name,
    questionBody: note.question.questionText,
    wrongCount: note.wrongCount,
    nextReviewAt,
    overdueDays,
  };
}

export default function HomeContent() {
  const [todayItems, setTodayItems] = useState<ReviewItemData[]>([]);
  const [futureItems, setFutureItems] = useState<ReviewItemData[]>([]);
  const [unscheduledItems, setUnscheduledItems] = useState<ReviewItemData[]>(
    []
  );
  const [activeCount, setActiveCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setError("");
      const [todayNotes, activeNotes, masteredNotes] = await Promise.all([
        mistakeNotesApi.listTodayV1MistakeNotesTodayGet(),
        mistakeNotesApi.listActiveV1MistakeNotesGet(),
        mistakeNotesApi.listMasteredV1MistakeNotesMasteredGet(),
      ]);

      const todayIds = new Set(todayNotes.map((n) => n.id));
      const future: MistakeNoteResponse[] = [];
      const unscheduled: MistakeNoteResponse[] = [];
      for (const note of activeNotes) {
        if (todayIds.has(note.id)) continue;
        if (note.nextReviewAt === null) {
          unscheduled.push(note);
        } else {
          future.push(note);
        }
      }

      setTodayItems(todayNotes.map(toReviewItem));
      setFutureItems(future.map(toReviewItem));
      setUnscheduledItems(unscheduled.map(toReviewItem));
      setActiveCount(activeNotes.length);
      setMasteredCount(masteredNotes.length);
    } catch {
      setError("データの取得に失敗しました。再読み込みしてください。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSetReviewDate(noteId: string, date: string) {
    try {
      await mistakeNotesApi.updateNoteV1MistakeNotesNoteIdPut({
        noteId,
        mistakeNoteUpdate: { nextReviewAt: new Date(date) },
      });
      await loadAll();
    } catch {
      setError("復習日の設定に失敗しました。");
    }
  }

  if (loading) {
    return (
      <div className="p-9 max-w-[1000px] text-[14px] text-muted">
        読み込み中…
      </div>
    );
  }

  const hasToday = todayItems.length > 0;
  const hasAnyNotes = activeCount > 0;
  const showList =
    hasToday || futureItems.length > 0 || unscheduledItems.length > 0;

  return (
    <div className="p-9 max-w-[1000px]">
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      )}

      <SummaryCards
        todayCount={todayItems.length}
        activeCount={activeCount}
        masteredCount={masteredCount}
      />

      {/* Today's reviews are all done (but notes exist) */}
      {!hasToday && hasAnyNotes && <EmptyState variant="done-today" />}

      {/* No notes at all */}
      {!hasAnyNotes && <EmptyState variant="no-notes" />}

      {/* Today + upcoming + unscheduled in one list */}
      {showList && (
        <ReviewList
          todayItems={todayItems}
          futureItems={futureItems}
          unscheduledItems={unscheduledItems}
          onSetReviewDate={handleSetReviewDate}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -i "home-content"`
Expected: 出力なし

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/home/home-content.tsx
git commit -m "feat: fetch and render home review lists from mistake-notes API"
```

---

### Task 4: `page.tsx`からモックデータを除去し`HomeContent`を配線する

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Interfaces:**
- Consumes: `HomePageHeader`（`@/components/home/page-header`、変更なし・propなし）、`HomeContent`（Task 3、propなし）

- [ ] **Step 1: `page.tsx`の全文を置き換える**

```tsx
import HomePageHeader from "@/components/home/page-header";
import HomeContent from "@/components/home/home-content";

export default function HomePage() {
  return (
    <>
      <HomePageHeader />
      <HomeContent />
    </>
  );
}
```

- [ ] **Step 2: 型チェック**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -i "app/page.tsx"`
Expected: 出力なし

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: wire home page to HomeContent, drop mock review data"
```

---

### Task 5: エンドツーエンド検証

**Files:** なし（動作確認のみ）

- [ ] **Step 1: バックエンドを起動する**

Run: `docker compose up -d`
Expected: `misnote-db-1`, `misnote-api-1` が `running`/`healthy`。既存の`postgres_data`ボリュームが生きていれば追加のマイグレーションは不要。念のため:

Run: `docker exec misnote-api-1 alembic upgrade head`
Expected: `Already at head` または正常終了

- [ ] **Step 2: 現状のmistake-notesデータをcurlで確認する**

Run: `curl -s http://localhost:8000/v1/mistake-notes | python3 -m json.tool`
Run: `curl -s http://localhost:8000/v1/mistake-notes/today | python3 -m json.tool`
Run: `curl -s http://localhost:8000/v1/mistake-notes/mastered | python3 -m json.tool`
Expected: 3つとも200 OKでJSON配列が返る（空配列でもよい）。件数をメモしておき、後続のブラウザ確認と突き合わせる。

- [ ] **Step 3: 復習日未設定のノートが無い場合、テスト用に1件作る**

`next_review_at`がnullのアクティブなノートが1件も無い場合、UIの日付設定フローを確認できないため、以下で問題を1件登録する（`memo`を渡すとmistake_noteが自動生成され、`next_review_at`を省略すればnullになる）:

```bash
SUBJECT_ID=$(curl -s http://localhost:8000/v1/subjects | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['id'])")
curl -s -X POST http://localhost:8000/v1/questions \
  -H "Content-Type: application/json" \
  -d "{\"subject_id\": \"$SUBJECT_ID\", \"question_text\": \"E2E確認用の問題\", \"memo\": \"確認用\"}" \
  | python3 -m json.tool
```

Expected: 201相当でquestionが返る。この問題が苦手問題一覧・復習日未設定に載る。

- [ ] **Step 4: フロントエンドを起動しブラウザで確認する**

Run: `cd frontend && npm run dev`（既存の:3000プロセスがあればそれを使う）
`http://localhost:3000` を開き、以下を確認する:

- サマリーカード（Today/苦手問題/克服済み）の数値がStep 2のcurl結果の件数と一致する
- 「復習日未設定」セクションにStep 3で作った問題が表示される
- その行の日付inputで日付（例: 今日の日付）を選択する → 選択直後にその行が消え、サマリーの数値が変わらないまま（activeCount一定）、選択した日付に応じて「復習リスト」または「明日以降の予定」に移動する
- 「復習リスト」「明日以降の予定」の各行をクリックすると `/review/{id}` に遷移する（画面自体は未実装なので404表示でよい。クリックで意図しないページ遷移エラーにならないことのみ確認）
- 苦手問題が1件も無い状態（該当データがあれば）で「間違えた問題を登録して復習をはじめよう」の空状態が出ること。今日の分だけ0件なら「今日の復習は完了！」が出ること

- [ ] **Step 5: 復習日設定がAPI側にも反映されていることをcurlで確認する**

Run: `curl -s http://localhost:8000/v1/mistake-notes | python3 -m json.tool | grep -A2 "E2E確認用の問題"`
Expected: Step 4で設定した`next_review_at`が反映されている

- [ ] **Step 6: 型チェックの最終確認（プロジェクト全体、生成コード起因の既存エラーは許容）**

Run: `cd frontend && npx tsc --noEmit 2>&1 | grep -v "src/generated"`
Expected: 出力なし（`src/generated/`以外に起因するエラーが無いこと）
