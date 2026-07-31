def test_create_and_list_subject(client):
    created = client.post("/v1/subjects", json={"name": "数学"})
    assert created.status_code == 201
    assert created.json()["name"] == "数学"

    listed = client.get("/v1/subjects")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_update_subject(client):
    subject_id = client.post("/v1/subjects", json={"name": "数学"}).json()["id"]

    updated = client.put(f"/v1/subjects/{subject_id}", json={"name": "算数"})
    assert updated.status_code == 200
    assert updated.json()["name"] == "算数"


def test_delete_subject(client):
    subject_id = client.post("/v1/subjects", json={"name": "数学"}).json()["id"]

    assert client.delete(f"/v1/subjects/{subject_id}").status_code == 204
    assert client.get("/v1/subjects").json() == []


def test_delete_subject_with_units_returns_409(client):
    subject_id = client.post("/v1/subjects", json={"name": "数学"}).json()["id"]
    client.post(f"/v1/subjects/{subject_id}/units", json={"name": "二次方程式"})

    response = client.delete(f"/v1/subjects/{subject_id}")
    assert response.status_code == 409
    assert response.json()["detail"] == "Subject has related units or questions"


def test_update_unknown_subject_returns_404(client):
    response = client.put(
        "/v1/subjects/00000000-0000-0000-0000-000000000099", json={"name": "無い"}
    )
    assert response.status_code == 404
