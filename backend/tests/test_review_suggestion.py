from datetime import date, timedelta

import pytest


@pytest.fixture()
def subject_id(client) -> str:
    return client.post("/v1/subjects", json={"name": "数学"}).json()["id"]


@pytest.fixture()
def question_id(client, subject_id) -> str:
    """ノート付きの問題（登録時に memo を書くとノートが作られる）。"""
    response = client.post(
        "/v1/questions",
        json={
            "subject_id": subject_id,
            "question_text": "x^2-5x+6=0 を解け",
            "memo": "因数分解の形を見落とした",
        },
    )
    return response.json()["id"]


def _attempt(client, question_id, is_correct: bool) -> dict:
    response = client.post(
        f"/v1/questions/{question_id}/attempts", json={"is_correct": is_correct}
    )
    assert response.status_code == 201
    return response.json()


def _in_days(days: int) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


def test_an_incorrect_attempt_suggests_tomorrow(client, question_id):
    attempt = _attempt(client, question_id, is_correct=False)
    assert attempt["suggested_next_review_at"] == _in_days(1)


@pytest.mark.parametrize(
    ("correct_answers", "expected_days"),
    [(1, 3), (2, 7), (3, 14), (4, 14)],
)
def test_the_interval_grows_with_the_correct_streak(
    client, question_id, correct_answers, expected_days
):
    for _ in range(correct_answers):
        attempt = _attempt(client, question_id, is_correct=True)
    assert attempt["suggested_next_review_at"] == _in_days(expected_days)


def test_an_incorrect_attempt_resets_the_suggestion_to_tomorrow(client, question_id):
    for _ in range(3):
        _attempt(client, question_id, is_correct=True)

    attempt = _attempt(client, question_id, is_correct=False)
    assert attempt["suggested_next_review_at"] == _in_days(1)


def test_a_question_without_a_note_gets_no_suggestion(
    client, db_session, user, subject_id
):
    """一度も間違えていない問題に正解しても、提案するノートがないこと。"""
    import uuid

    from app.models.question import Question

    question = Question(
        user_id=user.id,
        subject_id=uuid.UUID(subject_id),
        question_text="ノートのない問題",
    )
    db_session.add(question)
    db_session.flush()

    attempt = _attempt(client, str(question.id), is_correct=True)
    assert attempt["correct_streak"] is None
    assert attempt["suggested_next_review_at"] is None
