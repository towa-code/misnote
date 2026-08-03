import pytest

from app.deps import get_current_user_id
from app.main import app as fastapi_app


@pytest.fixture()
def as_user(anon_client, user):
    """user として振る舞うクライアント。"""
    fastapi_app.dependency_overrides[get_current_user_id] = lambda: user.id
    return anon_client


@pytest.fixture()
def switch_to(anon_client):
    """呼ぶたびに現在のユーザーを切り替えるヘルパー。"""

    def _switch(target):
        fastapi_app.dependency_overrides[get_current_user_id] = lambda: target.id
        return anon_client

    return _switch


def test_subjects_are_not_visible_to_other_users(as_user, switch_to, other_user):
    as_user.post("/v1/subjects", json={"name": "数学"})

    assert switch_to(other_user).get("/v1/subjects").json() == []


def test_another_users_subject_cannot_be_updated(as_user, switch_to, other_user):
    subject_id = as_user.post("/v1/subjects", json={"name": "数学"}).json()["id"]

    response = switch_to(other_user).put(f"/v1/subjects/{subject_id}", json={"name": "乗っ取り"})
    assert response.status_code == 404


def test_units_of_another_users_subject_cannot_be_listed(as_user, switch_to, other_user):
    subject_id = as_user.post("/v1/subjects", json={"name": "数学"}).json()["id"]

    response = switch_to(other_user).get(f"/v1/subjects/{subject_id}/units")
    assert response.status_code == 404


def test_units_cannot_be_created_under_another_users_subject(as_user, switch_to, other_user):
    subject_id = as_user.post("/v1/subjects", json={"name": "数学"}).json()["id"]

    response = switch_to(other_user).post(
        f"/v1/subjects/{subject_id}/units", json={"name": "侵入した単元"}
    )
    assert response.status_code == 404


def test_another_users_unit_cannot_be_updated_or_deleted(as_user, switch_to, other_user):
    subject_id = as_user.post("/v1/subjects", json={"name": "数学"}).json()["id"]
    unit_id = as_user.post(
        f"/v1/subjects/{subject_id}/units", json={"name": "二次方程式"}
    ).json()["id"]

    intruder = switch_to(other_user)
    assert intruder.put(f"/v1/units/{unit_id}", json={"name": "乗っ取り"}).status_code == 404
    assert intruder.delete(f"/v1/units/{unit_id}").status_code == 404


def test_the_owner_can_still_manage_their_units(as_user):
    subject_id = as_user.post("/v1/subjects", json={"name": "数学"}).json()["id"]
    unit_id = as_user.post(
        f"/v1/subjects/{subject_id}/units", json={"name": "二次方程式"}
    ).json()["id"]

    assert as_user.get(f"/v1/subjects/{subject_id}/units").status_code == 200
    assert as_user.put(f"/v1/units/{unit_id}", json={"name": "因数分解"}).status_code == 200
    assert as_user.delete(f"/v1/units/{unit_id}").status_code == 204


def test_questions_and_notes_are_not_visible_to_other_users(as_user, switch_to, other_user):
    subject_id = as_user.post("/v1/subjects", json={"name": "数学"}).json()["id"]
    as_user.post(
        "/v1/questions",
        json={
            "subject_id": subject_id,
            "question_text": "x^2-5x+6=0 を解け",
            "memo": "因数分解の形を見落とした",
        },
    )

    intruder = switch_to(other_user)
    assert intruder.get("/v1/questions").json() == []
    assert intruder.get("/v1/mistake-notes").json() == []
