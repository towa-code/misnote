from datetime import datetime, timezone

from app.models.draft import Draft


def test_create_and_list_draft(client):
    created = client.post("/v1/drafts", json={"body": "x^2-5x+6=0 を解け"})
    assert created.status_code == 201
    assert created.json()["body"] == "x^2-5x+6=0 を解け"

    listed = client.get("/v1/drafts")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_empty_body_is_rejected(client):
    assert client.post("/v1/drafts", json={"body": ""}).status_code == 422


def test_drafts_are_listed_newest_first(client, db_session, user):
    # created_at は server_default now() で、テストは1トランザクション内なので
    # API 経由で2件作ると同じ時刻になる。順序を検証するため直接書き込む。
    db_session.add_all(
        [
            Draft(user_id=user.id, body="古い", created_at=datetime(2026, 1, 1, tzinfo=timezone.utc)),
            Draft(user_id=user.id, body="新しい", created_at=datetime(2026, 2, 1, tzinfo=timezone.utc)),
        ]
    )
    db_session.commit()

    bodies = [d["body"] for d in client.get("/v1/drafts").json()]
    assert bodies == ["新しい", "古い"]


def test_get_draft(client):
    draft_id = client.post("/v1/drafts", json={"body": "あとで整理する"}).json()["id"]

    response = client.get(f"/v1/drafts/{draft_id}")
    assert response.status_code == 200
    assert response.json()["body"] == "あとで整理する"


def test_get_unknown_draft_returns_404(client):
    response = client.get("/v1/drafts/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404


def test_delete_draft(client):
    draft_id = client.post("/v1/drafts", json={"body": "あとで整理する"}).json()["id"]

    assert client.delete(f"/v1/drafts/{draft_id}").status_code == 204
    assert client.get("/v1/drafts").json() == []


def test_delete_unknown_draft_returns_404(client):
    response = client.delete("/v1/drafts/00000000-0000-0000-0000-000000000099")
    assert response.status_code == 404
