import type { ReasonTagStatsRow } from "@/generated";
import { REASON_TAGS, reasonTagLabel, type ReasonTag } from "@/lib/reason-tags";

// 分析画面（/stats）の集計と分析文。API は教科 × 単元 × タグの件数だけを返すので、
// 割合・比較・文章はすべてここで作る。LLM は使わず、ルールとしきい値で決める。

// --- しきい値（使ってみて調整する前提で1か所にまとめる） ---

/** タグ付きノートがこれ未満なら、分析文は出さずに棒グラフだけ見せる */
export const MIN_TAGGED_NOTES = 5;
/** ② 教科の偏り: 教科のタグ付きノート数の下限と、全体との差（pt） */
const SUBJECT_MIN_NOTES = 5;
const SUBJECT_DIFF_PT = 15;
/** ③ 単元への集中: 教科 × タグの件数の下限と、1単元が占める割合 */
const UNIT_MIN_NOTES = 3;
const UNIT_SHARE = 0.5;
/** ④ 克服しやすさの差: 比べる各タグの件数の下限と、克服率の差（pt） */
const MASTERY_MIN_NOTES = 5;
const MASTERY_DIFF_PT = 30;
/** ⑤ 繰り返し: タグの件数の下限と、1問あたりの平均間違い回数 */
const REPEAT_MIN_NOTES = 3;
const REPEAT_AVG = 2;
/** 表示する分析文の数と、同じ種類の文の上限（似た文ばかり並ばないように） */
const MAX_INSIGHTS = 5;
const MAX_PER_KIND = 2;

// --- アドバイス文（どの文も「事実 → 次にどうするか」で終わらせる） ---

/** タグごとの対策。① 全体で最多、② 教科の偏り で使う */
const TAG_ADVICE: Record<ReasonTag, string> = {
  misread:
    "解き始める前に、問題の条件と「何を求めるか」に線を引く習慣をつけましょう。",
  approach:
    "解答を読んで終わりにせず、「どこに気づけばこの解き方を選べたか」をメモに一言残しましょう。",
  knowledge:
    "公式や定義は、使う場面とセットで覚え直しましょう。何も見ずに書き出せるか試すのが効果的です。",
  calculation:
    "途中式を省かずに書き、最後に検算しましょう。自分がよくやるミス（符号・単位など）を知っておくのも有効です。",
  time: "時間を計って解く練習を取り入れ、詰まった問題を飛ばす判断も練習しておきましょう。",
  other: "メモを見返して、共通する原因がないか探してみましょう。",
};

/** ③ 単元に集中しているときの対策。単元名を差し込む */
const UNIT_ADVICE: Record<ReasonTag, (unit: string) => string> = {
  misread: (u) => `「${u}」の問題は、問われていることを書き出してから解き始めましょう。`,
  approach: (u) =>
    `「${u}」は教科書や基本問題に戻って、典型的な解き方を整理し直すのがおすすめです。`,
  knowledge: (u) =>
    `「${u}」で使う公式や定義を一覧にまとめ、何も見ずに書けるか確かめましょう。`,
  calculation: (u) =>
    `「${u}」の計算は特に丁寧に。途中式を残して、どこで間違えたかを確かめられるようにしましょう。`,
  time: (u) =>
    `「${u}」は時間を計って解く練習を重ね、解く手順をすぐ思い出せるようにしましょう。`,
  other: (u) => `「${u}」の問題のメモを見返して、共通点を探してみましょう。`,
};

// --- 集計 ---

type TagTotals = { notes: number; mastered: number; wrongSum: number };

export type SubjectStats = {
  id: string;
  name: string;
  /** タグ付きノート数（未設定は含まない） */
  total: number;
  counts: Record<ReasonTag, number>;
  /** タグ → 単元名 → 件数。単元なしの問題は含めない */
  units: Record<ReasonTag, Map<string, number>>;
};

export type ReasonTagStatsView = {
  /** タグ付きノート数 */
  total: number;
  /** タグ未設定のノート数（集計の外） */
  untagged: number;
  overall: Record<ReasonTag, number>;
  byTag: Record<ReasonTag, TagTotals>;
  /** タグ付きノートが1件以上ある教科だけ。件数の多い順 */
  subjects: SubjectStats[];
};

function perTag<T>(make: () => T): Record<ReasonTag, T> {
  return Object.fromEntries(REASON_TAGS.map((t) => [t.value, make()])) as Record<
    ReasonTag,
    T
  >;
}

export function aggregate(rows: ReasonTagStatsRow[]): ReasonTagStatsView {
  const overall = perTag(() => 0);
  const byTag = perTag<TagTotals>(() => ({ notes: 0, mastered: 0, wrongSum: 0 }));
  const subjects = new Map<string, SubjectStats>();
  let total = 0;
  let untagged = 0;

  for (const row of rows) {
    const tag = row.reasonTag;
    if (tag === null) {
      untagged += row.noteCount;
      continue;
    }
    total += row.noteCount;
    overall[tag] += row.noteCount;
    byTag[tag].notes += row.noteCount;
    byTag[tag].mastered += row.masteredCount;
    byTag[tag].wrongSum += row.wrongCountSum;

    let subject = subjects.get(row.subjectId);
    if (!subject) {
      subject = {
        id: row.subjectId,
        name: row.subjectName,
        total: 0,
        counts: perTag(() => 0),
        units: perTag(() => new Map<string, number>()),
      };
      subjects.set(row.subjectId, subject);
    }
    subject.total += row.noteCount;
    subject.counts[tag] += row.noteCount;
    if (row.unitName !== null) {
      const units = subject.units[tag];
      units.set(row.unitName, (units.get(row.unitName) ?? 0) + row.noteCount);
    }
  }

  return {
    total,
    untagged,
    overall,
    byTag,
    subjects: [...subjects.values()].sort((a, b) => b.total - a.total),
  };
}

// --- 分析文 ---

export type InsightKind = "top" | "subject" | "unit" | "mastery" | "repeat";

export type Insight = {
  kind: InsightKind;
  /** 何が起きているか */
  fact: string;
  /** 次にどうするか */
  advice: string;
  /** 並べ替え用。しきい値ちょうどで 1、目立つ傾向ほど大きい */
  score: number;
};

const pct = (part: number, whole: number) => Math.round((part / whole) * 100);
const label = (tag: ReasonTag) => `「${reasonTagLabel(tag)}」`;

/** 件数が最大のタグ。同数なら REASON_TAGS の並び（解く過程の順）で先のもの */
function topTag(counts: Record<ReasonTag, number>): ReasonTag {
  return REASON_TAGS.reduce((best, t) =>
    counts[t.value] > counts[best.value] ? t : best
  ).value;
}

// ① 全体で一番多いタグ
function topInsight(view: ReasonTagStatsView, tag: ReasonTag): Insight {
  return {
    kind: "top",
    fact: `あなたの間違いで一番多いのは${label(tag)}（全体の${pct(view.overall[tag], view.total)}%）です。`,
    advice: TAG_ADVICE[tag],
    // 常に先頭に出す
    score: Number.POSITIVE_INFINITY,
  };
}

// ② 全体と比べて、ある教科で特に多いタグ（教科ごとに一番差が大きいもの1つ）。
// ① と同じタグなら対策文はもう出ているので、繰り返さずに①を指す。
function subjectInsights(view: ReasonTagStatsView, top: ReasonTag): Insight[] {
  const insights: Insight[] = [];
  for (const subject of view.subjects) {
    if (subject.total < SUBJECT_MIN_NOTES) continue;
    let best: { tag: ReasonTag; share: number; diff: number } | null = null;
    for (const { value: tag } of REASON_TAGS) {
      const share = pct(subject.counts[tag], subject.total);
      const diff = share - pct(view.overall[tag], view.total);
      if (diff >= SUBJECT_DIFF_PT && (!best || diff > best.diff)) {
        best = { tag, share, diff };
      }
    }
    if (!best) continue;
    insights.push({
      kind: "subject",
      fact: `${subject.name}は全体と比べて${label(best.tag)}が多め（${best.share}%、全体より+${best.diff}pt）です。`,
      advice:
        best.tag === top
          ? `一番上の対策を、${subject.name}では特に意識しましょう。`
          : `${subject.name}を解くときは特に、${TAG_ADVICE[best.tag]}`,
      score: best.diff / SUBJECT_DIFF_PT,
    });
  }
  return insights;
}

// ③ ある教科のあるタグが、1つの単元に偏っている
function unitInsights(view: ReasonTagStatsView): Insight[] {
  const insights: Insight[] = [];
  for (const subject of view.subjects) {
    for (const { value: tag } of REASON_TAGS) {
      const count = subject.counts[tag];
      if (count < UNIT_MIN_NOTES) continue;
      for (const [unit, unitCount] of subject.units[tag]) {
        const share = unitCount / count;
        if (share < UNIT_SHARE) continue;
        insights.push({
          kind: "unit",
          fact: `${subject.name}の${label(tag)}${count}件のうち${unitCount}件が「${unit}」に集中しています。`,
          advice: UNIT_ADVICE[tag](unit),
          score: share / UNIT_SHARE,
        });
      }
    }
  }
  return insights;
}

// ④ 克服率が一番高いタグと低いタグの差
function masteryInsight(view: ReasonTagStatsView): Insight[] {
  const rates = REASON_TAGS.filter((t) => view.byTag[t.value].notes >= MASTERY_MIN_NOTES).map(
    (t) => ({
      tag: t.value,
      rate: pct(view.byTag[t.value].mastered, view.byTag[t.value].notes),
    })
  );
  if (rates.length < 2) return [];
  const high = rates.reduce((a, b) => (b.rate > a.rate ? b : a));
  const low = rates.reduce((a, b) => (b.rate < a.rate ? b : a));
  const diff = high.rate - low.rate;
  if (diff < MASTERY_DIFF_PT) return [];
  return [
    {
      kind: "mastery",
      fact: `${label(high.tag)}は${high.rate}%克服できていますが、${label(low.tag)}は${low.rate}%にとどまっています。`,
      advice: `${label(low.tag)}タイプの問題は一度正解しても安心せず、間隔をあけて何度か解き直しましょう。`,
      score: diff / MASTERY_DIFF_PT,
    },
  ];
}

// ⑤ 同じ問題で何度も間違えているタグ
function repeatInsights(view: ReasonTagStatsView): Insight[] {
  const insights: Insight[] = [];
  for (const { value: tag } of REASON_TAGS) {
    const { notes, wrongSum } = view.byTag[tag];
    if (notes < REPEAT_MIN_NOTES) continue;
    const avg = wrongSum / notes;
    if (avg < REPEAT_AVG) continue;
    insights.push({
      kind: "repeat",
      fact: `${label(tag)}の問題は、1問あたり平均${avg.toFixed(1)}回間違えています。同じミスを繰り返しているかもしれません。`,
      advice: "解き直す前に、前回書いたメモを読み返してから取りかかりましょう。",
      score: avg / REPEAT_AVG,
    });
  }
  return insights;
}

/**
 * 表示する分析文を、目立つ傾向の順に最大 MAX_INSIGHTS 件返す。
 * タグ付きノートが MIN_TAGGED_NOTES 未満なら空（データが少なすぎて傾向と言えないため）。
 */
export function buildInsights(view: ReasonTagStatsView): Insight[] {
  if (view.total < MIN_TAGGED_NOTES) return [];

  const top = topTag(view.overall);
  const candidates = [
    ...subjectInsights(view, top),
    ...unitInsights(view),
    ...masteryInsight(view),
    ...repeatInsights(view),
  ].sort((a, b) => b.score - a.score);

  const picked: Insight[] = [topInsight(view, top)];
  const perKind = new Map<InsightKind, number>();
  for (const insight of candidates) {
    if (picked.length >= MAX_INSIGHTS) break;
    const used = perKind.get(insight.kind) ?? 0;
    if (used >= MAX_PER_KIND) continue;
    perKind.set(insight.kind, used + 1);
    picked.push(insight);
  }
  return picked;
}
