def test_health_returns_ok(anon_client):
    response = anon_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_client_fixture_writes_as_its_user(client):
    """client fixture が認証済みとして振る舞い、書き込みが読み戻せること。

    次の test_... _is_rolled_back と対になっている（この順に実行される前提）。
    """
    created = client.post("/v1/subjects", json={"name": "数学"})
    assert created.status_code == 201

    listed = client.get("/v1/subjects")
    assert listed.status_code == 200
    assert [s["name"] for s in listed.json()] == ["数学"]


def test_what_the_previous_test_wrote_is_rolled_back(db_session):
    """直前のテストが作った科目が DB に残っていないこと（巻き戻しの確認）。

    /v1/subjects を見るだけでは不十分。user fixture が毎回別のユーザーを作るので、
    巻き戻しが効いていなくても一覧は空になる。テーブル全体の件数で見る。
    """
    from app.models.subject import Subject

    assert db_session.query(Subject).count() == 0
