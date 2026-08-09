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
