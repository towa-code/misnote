import pytest


@pytest.fixture()
def subject_id(client) -> str:
    return client.post("/v1/subjects", json={"name": "数学"}).json()["id"]


def _add_note(client, subject_id: str, text: str) -> str:
    """問題を1問登録する。memo 付きの登録は mistake_note を作るので、note が1件増える。"""
    return client.post(
        "/v1/questions",
        json={
            "subject_id": subject_id,
            "question_text": text,
            "memo": "符号を間違えた",
        },
    ).json()["id"]


def _master_note_of(client, question_id: str) -> None:
    note = next(
        n
        for n in client.get("/v1/mistake-notes").json()
        if n["question"]["id"] == question_id
    )
    client.put(f"/v1/mistake-notes/{note['id']}/status", json={"status": "mastered"})


def test_summary_is_zero_for_an_account_with_no_notes(client):
    response = client.get("/v1/stats/summary")
    assert response.status_code == 200
    assert response.json() == {"mastered_count": 0, "total_count": 0}


def test_total_counts_active_and_mastered_notes(client, subject_id):
    _add_note(client, subject_id, "問1")
    _add_note(client, subject_id, "問2")
    mastered = _add_note(client, subject_id, "問3")
    _master_note_of(client, mastered)

    assert client.get("/v1/stats/summary").json() == {
        "mastered_count": 1,
        "total_count": 3,
    }


# --- GET /v1/stats/reason-tags ---


def _add_tagged_note(client, subject_id, unit_id=None, reason_tag=None) -> str:
    body = {"subject_id": subject_id, "question_text": "問", "memo": "メモ"}
    if unit_id is not None:
        body["unit_id"] = unit_id
    if reason_tag is not None:
        body["reason_tag"] = reason_tag
    return client.post("/v1/questions", json=body).json()["id"]


def _rows_by_key(response) -> dict:
    return {(r["unit_name"], r["reason_tag"]): r for r in response.json()["rows"]}


def test_reason_tags_is_empty_for_an_account_with_no_notes(client):
    response = client.get("/v1/stats/reason-tags")
    assert response.status_code == 200
    assert response.json() == {"rows": []}


def test_reason_tags_groups_by_subject_unit_and_tag(client, subject_id):
    unit_id = client.post(
        f"/v1/subjects/{subject_id}/units", json={"name": "数列"}
    ).json()["id"]
    _add_tagged_note(client, subject_id, unit_id, "approach")
    _add_tagged_note(client, subject_id, unit_id, "approach")
    _add_tagged_note(client, subject_id, None, "calculation")
    _add_tagged_note(client, subject_id, None, None)

    rows = _rows_by_key(client.get("/v1/stats/reason-tags"))

    assert set(rows) == {("数列", "approach"), (None, "calculation"), (None, None)}
    seq = rows[("数列", "approach")]
    assert seq["subject_id"] == subject_id
    assert seq["subject_name"] == "数学"
    assert seq["unit_id"] == unit_id
    assert seq["note_count"] == 2
    assert rows[(None, "calculation")]["unit_id"] is None
    # タグ未設定のノートも null タグの行として返る
    assert rows[(None, None)]["note_count"] == 1


def test_reason_tags_counts_mastered_and_wrong_counts(client, subject_id):
    first = _add_tagged_note(client, subject_id, None, "misread")
    _add_tagged_note(client, subject_id, None, "misread")
    _master_note_of(client, first)
    # 不正解をもう1回記録すると、その問題の wrong_count が 2 になる
    client.post(f"/v1/questions/{first}/attempts", json={"is_correct": False})

    row = _rows_by_key(client.get("/v1/stats/reason-tags"))[(None, "misread")]

    assert row["note_count"] == 2
    # 不正解で mastered → active に戻るので、克服済みは 0 になる
    assert row["mastered_count"] == 0
    assert row["wrong_count_sum"] == 3


def test_reason_tags_counts_mastered_notes(client, subject_id):
    first = _add_tagged_note(client, subject_id, None, "time")
    _add_tagged_note(client, subject_id, None, "time")
    _master_note_of(client, first)

    row = _rows_by_key(client.get("/v1/stats/reason-tags"))[(None, "time")]

    assert row["note_count"] == 2
    assert row["mastered_count"] == 1
