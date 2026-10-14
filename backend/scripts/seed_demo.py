"""デモ用アカウントを作り、全画面を一通り見られるモックデータを API 経由で入れる。

    python3 backend/scripts/seed_demo.py

バックエンドを起動しておくこと（既定は http://localhost:8000。MISNOTE_API で変えられる）。
同じアカウントがすでにあれば、そのアカウントのデータを全部消してから入れ直す。
標準ライブラリだけで動く（venv 不要）。

分析画面（/stats）の分析文が5種類とも出るように件数を調整している:
① 最多は「覚えていなかった」 ② 化学に「覚えていなかった」が偏る
③ 英語の「時間切れ」が長文読解に集中 ④ 計算ミスは克服済みが多く、解き方は0件
⑤ 「解き方が思いつかなかった」は1問あたり3回以上間違えている
タグや件数を変えると、どの分析文が出るかも変わるので注意。
"""

import json
import os
import urllib.error
import urllib.request
from datetime import date, timedelta

API = os.environ.get("MISNOTE_API", "http://localhost:8000").rstrip("/") + "/v1"

# ローカル開発用のテストアカウント（本番では使わない）
EMAIL = "demo@example.com"
PASSWORD = "misnote-demo-pass"
NAME = "デモユーザー"

SUBJECTS = {
    "数学": ["二次関数", "三角比", "確率"],
    "物理": ["力学", "電磁気"],
    "化学": ["理論化学", "有機化学"],
    "英語": ["長文読解", "文法"],
}

# (科目, 単元, 問題文, 正解, メモ, タグ, 追加の不正解回数, 正解回数, 克服済みにするか, 復習日（今日から何日後）)
# 登録時に間違いノートが作られて wrong_count=1 になり、追加の不正解でさらに増える。
# 正解回数ぶん correct_streak が伸びる（3以上で復習画面に「もう完璧かも？」が出る）。
# 克服済みにすると復習日は消える。
QUESTIONS = [
    # --- 数学 ---
    ("数学", "二次関数", "y = x² − 4x + 1 の頂点の座標を求めよ。", "(2, −3)",
     "平方完成で −4 の半分の2乗を引き忘れた", "calculation", 0, 3, True, None),
    ("数学", "二次関数", "2次方程式 2x² − 5x + 3 = 0 を解け。", "x = 1, 3/2",
     "解の公式で分母の 2a を 2 にしてしまった", "calculation", 0, 3, True, None),
    ("数学", "二次関数", "y = −x² + 2x + 3 の 0 ≤ x ≤ 3 における最大値と最小値を求めよ。",
     "最大値 4（x = 1）、最小値 0（x = 3）", "端点を代入するときに符号を間違えた", "calculation", 1, 3, True, None),
    ("数学", "二次関数", "放物線 y = x² − 2ax + a + 2 が x 軸と接するときの a の値を求めよ。", "a = −1, 2",
     "判別式を展開するときに項を落とした", "calculation", 0, 3, True, None),
    ("数学", "二次関数", "y = 2x² + 8x + 5 を x 軸方向に −1、y 軸方向に 3 だけ平行移動した式を求めよ。",
     "y = 2x² + 12x + 18", "(x + 1)² の展開を間違えた", "calculation", 0, 3, True, None),
    ("数学", "二次関数", "x² − 6x + k > 0 がすべての実数 x で成り立つような k の範囲を求めよ。", "k > 9",
     "D < 0 の計算で 36 を 32 と書いていた", "calculation", 1, 1, False, 0),
    ("数学", "三角比", "sin θ = 1/3（0° < θ < 90°）のとき、cos θ の値を求めよ。", "2√2/3",
     "√8 を簡単にするのを忘れた", "calculation", 0, 0, False, 2),
    ("数学", "二次関数", "y = x² − 2ax + 3（0 ≤ x ≤ 2）の最小値を、a の値で場合分けして求めよ。",
     "a < 0 のとき 3、0 ≤ a ≤ 2 のとき −a² + 3、a > 2 のとき 7 − 4a",
     "軸の位置で場合分けする発想が出なかった", "approach", 3, 0, False, -2),
    ("数学", "三角比", "△ABC で a = 7, b = 5, c = 3 のとき、最大の角の大きさを求めよ。", "120°",
     "最大の辺の向かいの角が最大だと気づけなかった", "approach", 3, 0, False, -1),
    ("数学", "確率", "サイコロを3回投げるとき、出た目の最大値が5になる確率を求めよ。", "61/216",
     "「最大値が5以下」から「4以下」を引く考え方が浮かばなかった", "approach", 2, 1, False, 3),
    ("数学", None, "1 から 100 までの整数のうち、3 でも 5 でも割り切れない数の個数を求めよ。", "47 個",
     "補集合を使う方針が立たなかった", "approach", 2, 0, False, 1),
    ("数学", "確率", "赤玉 4 個・白玉 3 個から同時に 2 個取り出すとき、2 個とも同じ色である確率を求めよ。", "3/7",
     "「同時に」を「1個ずつ戻して」と読んでいた", "misread", 0, 3, True, None),
    ("数学", "三角比", "0° ≤ θ ≤ 180° のとき、2sin²θ − cos θ − 1 = 0 を満たす θ を求めよ。", "θ = 60°, 180°",
     "θ の範囲を 0°〜90° だと思い込んでいた", "misread", 0, 3, False, 0),
    ("数学", "二次関数", "y = x² − 4x + 5 の 1 ≤ x ≤ 4 における最小値を求めよ。", "1",
     "最大値を求めてしまった", "misread", 0, 0, False, 5),
    ("数学", "三角比", "sin 135° と cos 150° の値を求めよ。", "√2/2, −√3/2",
     "鈍角の三角比の符号を覚えていなかった", "knowledge", 1, 0, False, 4),
    ("数学", "三角比", "△ABC の外接円の半径を R とするとき、正弦定理を書け。", "a/sin A = b/sin B = c/sin C = 2R",
     "2R の部分を忘れていた", "knowledge", 0, 3, True, None),
    ("数学", "確率", "5 人を 1 列に並べるとき、A と B が隣り合う並べ方は何通りか。", "48 通り",
     "隣り合う2人をひとまとめにして数える", None, 0, 0, False, None),
    # --- 物理 ---
    ("物理", "力学", "傾き 30° のなめらかな斜面上で物体を静かにはなした。2 秒後の速さを求めよ（g = 9.8 m/s²）。",
     "9.8 m/s", "重力を斜面方向に分解する発想が出なかった", "approach", 3, 0, False, -3),
    ("物理", "力学", "長さ l の糸につけた小球を鉛直面内で円運動させる。最高点を通過できる最下点での最小の速さを求めよ。",
     "√(5gl)", "最高点で張力が0になる条件を使うと気づけなかった", "approach", 2, 0, False, 2),
    ("物理", "電磁気", "平行板コンデンサーの半分だけに誘電体（比誘電率 εr）を入れたときの電気容量を求めよ。",
     "C(1 + εr)/2", "2つのコンデンサーの並列とみなす発想がなかった", "approach", 3, 0, False, 6),
    ("物理", "電磁気", "磁束密度 B の磁場中を、長さ l の導体棒が速さ v で動くときの誘導起電力を求めよ。", "vBl",
     "ローレンツ力から考える方針が立たなかった", "approach", 2, 1, False, 0),
    ("物理", "力学", "運動量保存則が成り立つ条件を説明せよ。", "物体系に外力がはたらかない（内力のみ）",
     "条件をあいまいに覚えていた", "knowledge", 0, 3, True, None),
    ("物理", "電磁気", "キルヒホッフの第2法則を説明せよ。", "閉回路で、起電力の和と電圧降下の和が等しい",
     "第1法則と混同していた", "knowledge", 1, 0, False, 7),
    ("物理", "力学", "初速 14 m/s で鉛直に投げ上げた物体の最高点の高さを求めよ（g = 9.8 m/s²）。", "10 m",
     "v² = 2gh の割り算で桁を間違えた", "calculation", 0, 3, True, None),
    ("物理", "力学", "質量 2 kg の物体に 6 N の力を 3 秒間加えたときの速度の変化を求めよ。", "9 m/s",
     "力積を質量で割り忘れて 18 にしていた", "calculation", 0, 3, True, None),
    ("物理", "電磁気", "3 Ω と 6 Ω の抵抗を並列につないだときの合成抵抗を求めよ。", "2 Ω",
     "逆数の和を取ったあと、逆数に戻し忘れた", "calculation", 0, 0, False, 10),
    ("物理", "力学", "水平と 60° をなす向きに 20 m/s で投げた物体の、水平方向の初速度を求めよ。", "10 m/s",
     "「鉛直と」と読み違えて sin を使った", "misread", 1, 0, False, 1),
    ("物理", "電磁気", "電気量 2.0 C が 4.0 秒で導線を通過したときの電流を求めよ。", "0.50 A",
     "割る順番を逆にした", None, 0, 0, False, 3),
    # --- 化学 ---
    ("化学", "有機化学", "分子式 C4H10 で表される構造異性体の数を答えよ。", "2 種類",
     "枝分かれの数え方を覚えていなかった", "knowledge", 1, 0, False, -1),
    ("化学", "有機化学", "エタノールを濃硫酸とともに 170℃ で加熱したときの主生成物を答えよ。", "エチレン",
     "130℃ と 170℃ で生成物が違うのを覚えていなかった", "knowledge", 1, 0, False, 2),
    ("化学", "有機化学", "ヨードホルム反応を示す化合物の構造の特徴を答えよ。", "CH3CO− または CH3CH(OH)− をもつ",
     "構造をうろ覚えだった", "knowledge", 0, 3, True, None),
    ("化学", "有機化学", "フェノールの検出に使う試薬と、そのときの色を答えよ。", "塩化鉄(III)水溶液で紫色",
     "試薬の名前が出てこなかった", "knowledge", 1, 0, False, 5),
    ("化学", "理論化学", "アボガドロ定数の値を有効数字 2 桁で答えよ。", "6.0 × 10²³ /mol",
     "指数を 22 と覚えていた", "knowledge", 0, 3, True, None),
    ("化学", "理論化学", "理想気体の状態方程式を書け。", "PV = nRT",
     "気体定数 R の値と単位を覚えていなかった", "knowledge", 2, 0, False, 0),
    ("化学", "理論化学", "ルシャトリエの原理を説明せよ。", "条件の変化を和らげる向きに平衡が移動する",
     "説明の言葉が出てこなかった", "knowledge", 1, 0, False, 8),
    ("化学", "理論化学", "0.10 mol/L の塩酸 20 mL を中和するのに必要な 0.20 mol/L 水酸化ナトリウム水溶液の体積を求めよ。",
     "10 mL", "mL と L の換算を忘れた", "calculation", 0, 3, True, None),
    ("化学", "理論化学", "標準状態で 5.6 L の酸素の物質量を求めよ。", "0.25 mol",
     "「酸素原子」と読んでしまった", "misread", 0, 0, False, 3),
    ("化学", "有機化学", "C・H・O からなる化合物 4.6 mg を完全燃焼させると、CO2 が 8.8 mg、H2O が 5.4 mg 得られた。組成式を求めよ。",
     "C2H6O", "元素分析の手順が浮かばなかった", "approach", 3, 0, False, -2),
    # --- 英語 ---
    ("英語", "長文読解", "本文の内容と一致しないものを1つ選べ。", "③",
     "「一致するもの」を選んでいた", "misread", 0, 3, True, None),
    ("英語", "長文読解", "下線部の it が指すものを本文中から抜き出せ。", "the new policy",
     "直前の名詞だと決めつけて文脈を読まなかった", "misread", 0, 0, False, 4),
    ("英語", "文法", "次の英文で誤りを含む箇所を1つ選べ。", "④",
     "「正しい箇所」を選んでいた", "misread", 0, 3, True, None),
    ("英語", "文法", "日本文に合うように語句を並べかえたとき、3番目に来る語を答えよ。", "been",
     "「2番目」を答えていた", "misread", 1, 0, False, 1),
    ("英語", "文法", "I'm looking forward to (  ) you. ①see ②seeing ③seen から選べ。", "②",
     "to の後ろが動名詞になるのを忘れていた", "knowledge", 1, 0, False, 2),
    ("英語", "文法", "仮定法過去完了の基本の形を書け。", "If S had p.p., S would have p.p.",
     "would have の部分を覚えていなかった", "knowledge", 0, 0, False, 9),
    ("英語", "長文読解", "本文中の inevitable に最も意味が近いものを選べ。", "unavoidable",
     "単語の意味を知らなかった", "knowledge", 1, 0, False, 6),
    ("英語", "長文読解", "大問4（約800語の長文）を15分で解け。", None,
     "最後の2問を解く時間がなかった", "time", 1, 0, False, -1),
    ("英語", "長文読解", "共通テスト形式の長文問題（第6問）を解け。", None,
     "前半に時間をかけすぎた", "time", 0, 0, False, 3),
    ("英語", "長文読解", "英文の要旨を80字以内の日本語でまとめよ。", None,
     "下書きに時間を使いすぎた", "time", 1, 0, False, 7),
    ("英語", "文法", "It is no use crying over spilt milk. を和訳せよ。", "こぼれたミルクを嘆いても仕方がない",
     "マークシートを1つずれて塗っていた", "other", 0, 0, False, 12),
    ("英語", "長文読解", "本文のタイトルとして最も適切なものを選べ。", "①",
     "本文全体の主旨をつかめていなかった", None, 0, 3, True, None),
]

DRAFTS = [
    "数学の模試 大問3(2)：ベクトルの内積の最大値。あとで解き直す",
    "物理のワーク p.48 の単振動、エネルギー保存で解く方法を確認する",
    "英語の単語テストで間違えた：deliberate / inevitable / comprehensive",
]


def call(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req) as res:
        raw = res.read()
    return json.loads(raw) if raw else None


def login():
    """ログインできればそのトークンを、アカウントがなければ作ってからトークンを返す。"""
    creds = {"email": EMAIL, "password": PASSWORD}
    try:
        return call("POST", "/auth/login", body=creds)["access_token"], True
    except urllib.error.HTTPError as e:
        if e.code != 401:
            raise
    call("POST", "/auth/register", body={**creds, "name": NAME})
    return call("POST", "/auth/login", body=creds)["access_token"], False


def wipe(token):
    """このアカウントのデータを全部消す。問題を消すと間違いノートと解答履歴も一緒に消える。"""
    for q in call("GET", "/questions?limit=500", token):
        call("DELETE", f"/questions/{q['id']}", token)
    for d in call("GET", "/drafts?limit=500", token):
        call("DELETE", f"/drafts/{d['id']}", token)
    # 単元が残っている科目は消せない（409）ので、単元から消す
    for s in call("GET", "/subjects?limit=500", token):
        for u in call("GET", f"/subjects/{s['id']}/units?limit=500", token):
            call("DELETE", f"/units/{u['id']}", token)
        call("DELETE", f"/subjects/{s['id']}", token)


def seed(token):
    today = date.today()
    subject_ids, unit_ids = {}, {}
    for subject, units in SUBJECTS.items():
        subject_ids[subject] = call("POST", "/subjects", token, {"name": subject})["id"]
        for unit in units:
            unit_ids[(subject, unit)] = call(
                "POST", f"/subjects/{subject_ids[subject]}/units", token, {"name": unit}
            )["id"]

    for subject, unit, text, answer, memo, tag, wrongs, corrects, mastered, review in QUESTIONS:
        question = call("POST", "/questions", token, {
            "subject_id": subject_ids[subject],
            "unit_id": unit_ids[(subject, unit)] if unit else None,
            "question_text": text,
            "correct_answer": answer,
            "memo": memo,
            "reason_tag": tag,
            "next_review_at": (today + timedelta(days=review)).isoformat() if review is not None else None,
        })
        # 解答を記録しても復習日は書き換わらない（提案だけ）ので、上で入れた日付がそのまま残る
        for is_correct in [False] * wrongs + [True] * corrects:
            call("POST", f"/questions/{question['id']}/attempts", token, {"is_correct": is_correct})
        if mastered:
            call("PUT", f"/mistake-notes/{question['mistake_note_id']}/status", token, {"status": "mastered"})

    for body in DRAFTS:
        call("POST", "/drafts", token, {"body": body})


def main():
    token, existed = login()
    if existed:
        print(f"{EMAIL} のデータを消して入れ直します")
        wipe(token)
    seed(token)
    print(f"完了: 問題 {len(QUESTIONS)} 件・クイック保存 {len(DRAFTS)} 件")
    print(f"ログイン情報はこのファイル先頭の EMAIL / PASSWORD を参照（{__file__}）")


if __name__ == "__main__":
    main()
