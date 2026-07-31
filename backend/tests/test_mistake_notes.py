import pytest

MASTERY_THRESHOLD = 3


@pytest.fixture()
def question_id(client) -> str:
    subject_id = client.post("/v1/subjects", json={"name": "数学"}).json()["id"]
    return client.post(
        "/v1/questions",
        json={
            "subject_id": subject_id,
            "question_text": "x^2-5x+6=0 を解け",
            "memo": "因数分解の形を見落とした",
        },
    ).json()["id"]


def _only_note(client) -> dict:
    notes = client.get("/v1/mistake-notes").json()
    assert len(notes) == 1
    return notes[0]


def test_creating_a_question_with_memo_creates_a_note(client, question_id):
    note = _only_note(client)
    assert note["question"]["id"] == question_id
    assert note["status"] == "active"
    assert note["wrong_count"] == 1
    assert note["correct_streak"] == 0


def test_incorrect_attempt_increments_wrong_count_without_duplicating_the_note(
    client, question_id
):
    client.post(f"/v1/questions/{question_id}/attempts", json={"is_correct": False})

    note = _only_note(client)
    assert note["wrong_count"] == 2
    assert note["correct_streak"] == 0


def test_correct_attempt_increments_the_streak(client, question_id):
    response = client.post(
        f"/v1/questions/{question_id}/attempts",
        json={"is_correct": True, "user_answer": "x=2, 3"},
    )
    assert response.status_code == 201
    assert response.json()["correct_streak"] == 1
    assert response.json()["mastery_suggested"] is False


def test_three_correct_attempts_suggest_mastery_without_changing_status(
    client, question_id
):
    for _ in range(MASTERY_THRESHOLD - 1):
        response = client.post(
            f"/v1/questions/{question_id}/attempts", json={"is_correct": True}
        )
        assert response.json()["mastery_suggested"] is False

    response = client.post(
        f"/v1/questions/{question_id}/attempts", json={"is_correct": True}
    )
    assert response.json()["correct_streak"] == MASTERY_THRESHOLD
    assert response.json()["mastery_suggested"] is True

    # 提案どまりで、自動では mastered にならない
    assert _only_note(client)["status"] == "active"


def test_incorrect_attempt_resets_the_streak(client, question_id):
    client.post(f"/v1/questions/{question_id}/attempts", json={"is_correct": True})
    client.post(f"/v1/questions/{question_id}/attempts", json={"is_correct": False})

    assert _only_note(client)["correct_streak"] == 0


def test_marking_mastered_moves_the_note_between_lists(client, question_id):
    note_id = _only_note(client)["id"]

    response = client.put(f"/v1/mistake-notes/{note_id}/status", json={"status": "mastered"})
    assert response.status_code == 200

    assert client.get("/v1/mistake-notes").json() == []
    mastered = client.get("/v1/mistake-notes/mastered").json()
    assert len(mastered) == 1
    assert mastered[0]["next_review_at"] is None


def test_incorrect_attempt_reverts_a_mastered_note_to_active(client, question_id):
    note_id = _only_note(client)["id"]
    client.put(f"/v1/mistake-notes/{note_id}/status", json={"status": "mastered"})

    client.post(f"/v1/questions/{question_id}/attempts", json={"is_correct": False})

    assert client.get("/v1/mistake-notes/mastered").json() == []
    assert _only_note(client)["status"] == "active"


def test_today_excludes_notes_without_a_review_date(client, question_id):
    assert client.get("/v1/mistake-notes/today").json() == []


def test_today_includes_notes_due_today(client, question_id):
    from datetime import date

    note_id = _only_note(client)["id"]
    client.put(
        f"/v1/mistake-notes/{note_id}",
        json={"next_review_at": date.today().isoformat()},
    )

    today = client.get("/v1/mistake-notes/today").json()
    assert [n["id"] for n in today] == [note_id]


def test_correct_attempt_without_a_note_leaves_streak_and_mastery_null(
    client, db_session, user
):
    import uuid

    from app.models.question import Question

    # QuestionCreate.memo は必須なので、ノートなしの問題は API 経由では作れない。
    # DB に直接 insert する。
    subject_id = client.post("/v1/subjects", json={"name": "数学"}).json()["id"]
    question = Question(
        user_id=user.id,
        subject_id=uuid.UUID(subject_id),
        question_text="ノートのない問題",
    )
    db_session.add(question)
    db_session.flush()

    response = client.post(
        f"/v1/questions/{question.id}/attempts", json={"is_correct": True}
    )
    assert response.status_code == 201
    assert response.json()["correct_streak"] is None
    assert response.json()["mastery_suggested"] is None

    assert client.get("/v1/mistake-notes").json() == []


def test_reverting_to_active_via_status_endpoint_resets_the_streak(
    client, question_id
):
    client.post(f"/v1/questions/{question_id}/attempts", json={"is_correct": True})
    client.post(f"/v1/questions/{question_id}/attempts", json={"is_correct": True})
    note_id = _only_note(client)["id"]
    assert client.get("/v1/mistake-notes").json()[0]["correct_streak"] == 2

    client.put(f"/v1/mistake-notes/{note_id}/status", json={"status": "mastered"})

    response = client.put(
        f"/v1/mistake-notes/{note_id}/status", json={"status": "active"}
    )
    assert response.status_code == 200
    assert response.json()["correct_streak"] == 0
