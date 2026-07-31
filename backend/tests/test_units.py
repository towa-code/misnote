import pytest


@pytest.fixture()
def subject_id(client) -> str:
    return client.post("/v1/subjects", json={"name": "数学"}).json()["id"]


def test_create_and_list_unit(client, subject_id):
    created = client.post(f"/v1/subjects/{subject_id}/units", json={"name": "二次方程式"})
    assert created.status_code == 201

    listed = client.get(f"/v1/subjects/{subject_id}/units")
    assert listed.status_code == 200
    assert [u["name"] for u in listed.json()] == ["二次方程式"]


def test_update_unit(client, subject_id):
    unit_id = client.post(
        f"/v1/subjects/{subject_id}/units", json={"name": "二次方程式"}
    ).json()["id"]

    updated = client.put(f"/v1/units/{unit_id}", json={"name": "因数分解"})
    assert updated.status_code == 200
    assert updated.json()["name"] == "因数分解"


def test_delete_unit(client, subject_id):
    unit_id = client.post(
        f"/v1/subjects/{subject_id}/units", json={"name": "二次方程式"}
    ).json()["id"]

    assert client.delete(f"/v1/units/{unit_id}").status_code == 204
    assert client.get(f"/v1/subjects/{subject_id}/units").json() == []


def test_delete_unit_with_questions_returns_409(client, subject_id):
    unit_id = client.post(
        f"/v1/subjects/{subject_id}/units", json={"name": "二次方程式"}
    ).json()["id"]
    client.post(
        "/v1/questions",
        json={
            "subject_id": subject_id,
            "unit_id": unit_id,
            "question_text": "x^2-5x+6=0 を解け",
            "memo": "因数分解の形を見落とした",
        },
    )

    response = client.delete(f"/v1/units/{unit_id}")
    assert response.status_code == 409


def test_question_with_unit_from_another_subject_returns_400(client, subject_id):
    other_subject_id = client.post("/v1/subjects", json={"name": "英語"}).json()["id"]
    foreign_unit_id = client.post(
        f"/v1/subjects/{other_subject_id}/units", json={"name": "文法"}
    ).json()["id"]

    response = client.post(
        "/v1/questions",
        json={
            "subject_id": subject_id,
            "unit_id": foreign_unit_id,
            "question_text": "ちぐはぐな組み合わせ",
            "memo": "メモ",
        },
    )
    assert response.status_code == 400
