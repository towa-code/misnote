import pytest


@pytest.fixture()
def subject_id(client) -> str:
    return client.post("/v1/subjects", json={"name": "数学"}).json()["id"]


def _create_question(client, subject_id, **extra) -> dict:
    body = {
        "subject_id": subject_id,
        "question_text": "x^2-5x+6=0 を解け",
        **extra,
    }
    return client.post("/v1/questions", json=body)


def _only_note(client) -> dict:
    notes = client.get("/v1/mistake-notes").json()
    assert len(notes) == 1
    return notes[0]


def test_registering_with_a_tag_stores_it_on_the_note(client, subject_id):
    _create_question(
        client, subject_id, memo="因数分解の形を見落とした", reason_tag="misread"
    )
    assert _only_note(client)["reason_tag"] == "misread"


def test_a_tag_alone_is_not_enough_to_register(client, subject_id):
    """タグを付けても memo の必須は外れないこと。

    ノートの自動生成条件には reason_tag も入れてあるが、QuestionCreate.memo が
    必須である限りその分岐には到達しない。memo を任意に戻す機能案
    （docs/newfunction/quick-save.md）が入ったときに効いてくる。
    """
    assert _create_question(client, subject_id, reason_tag="calculation").status_code == 422


def test_registering_without_a_tag_leaves_it_null(client, subject_id):
    _create_question(client, subject_id, memo="因数分解の形を見落とした")
    assert _only_note(client)["reason_tag"] is None


@pytest.mark.parametrize("tag", ["", "けいさんミス", "CALCULATION", "unknown"])
def test_an_unknown_tag_is_rejected(client, subject_id, tag):
    assert _create_question(client, subject_id, reason_tag=tag).status_code == 422


def test_updating_a_note_changes_the_tag(client, subject_id):
    _create_question(client, subject_id, memo="符号ミス", reason_tag="calculation")
    note_id = _only_note(client)["id"]

    response = client.put(
        f"/v1/mistake-notes/{note_id}", json={"reason_tag": "knowledge"}
    )
    assert response.status_code == 200
    assert response.json()["reason_tag"] == "knowledge"


def test_sending_an_explicit_null_clears_the_tag(client, subject_id):
    _create_question(client, subject_id, memo="符号ミス", reason_tag="calculation")
    note_id = _only_note(client)["id"]

    response = client.put(f"/v1/mistake-notes/{note_id}", json={"reason_tag": None})
    assert response.status_code == 200
    assert response.json()["reason_tag"] is None


def test_omitting_the_tag_keeps_the_existing_one(client, subject_id):
    _create_question(client, subject_id, memo="符号ミス", reason_tag="calculation")
    note_id = _only_note(client)["id"]

    response = client.put(f"/v1/mistake-notes/{note_id}", json={"memo": "移項ミス"})
    assert response.status_code == 200
    assert response.json()["memo"] == "移項ミス"
    assert response.json()["reason_tag"] == "calculation"


def test_a_note_created_by_an_incorrect_attempt_has_no_tag(client, db_session, user, subject_id):
    """解答記録から自動生成されるノートは未分類で始まること。"""
    import uuid

    from app.models.question import Question

    # QuestionCreate.memo は必須なので、ノートなしの問題は API 経由では作れない。
    # DB に直接 insert する。
    question = Question(
        user_id=user.id,
        subject_id=uuid.UUID(subject_id),
        question_text="ノートのない問題",
    )
    db_session.add(question)
    db_session.flush()

    client.post(f"/v1/questions/{question.id}/attempts", json={"is_correct": False})

    assert _only_note(client)["reason_tag"] is None
