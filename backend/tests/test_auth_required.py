import pytest

PROTECTED_PATHS = [
    "/v1/subjects",
    "/v1/questions",
    "/v1/mistake-notes",
    "/v1/mistake-notes/today",
    "/v1/mistake-notes/mastered",
    "/v1/auth/me",
]

CREDENTIALS = {"email": "student@example.com", "password": "password123"}

# 存在しない UUID。認証がパス解決/DB 参照より先に効くはずなので、
# リソースが実在しなくても 401 になる（404 になったらそれ自体がバグ）。
DUMMY_ID = "00000000-0000-0000-0000-000000000000"

# (method, path, json body) のリスト。書き込み系メソッドと詳細ルート
# （/{id} 付き）を網羅する。
PROTECTED_METHOD_PATHS = [
    ("PUT", f"/v1/subjects/{DUMMY_ID}", {"name": "数学"}),
    ("DELETE", f"/v1/subjects/{DUMMY_ID}", None),
    ("GET", f"/v1/subjects/{DUMMY_ID}/units", None),
    ("POST", f"/v1/subjects/{DUMMY_ID}/units", {"name": "二次関数"}),
    ("PUT", f"/v1/units/{DUMMY_ID}", {"name": "二次関数"}),
    ("DELETE", f"/v1/units/{DUMMY_ID}", None),
    ("POST", "/v1/questions", {"subject_id": DUMMY_ID, "question_text": "1+1は?", "memo": "計算ミス"}),
    ("GET", f"/v1/questions/{DUMMY_ID}", None),
    ("PUT", f"/v1/questions/{DUMMY_ID}", {"subject_id": DUMMY_ID, "question_text": "1+1は?"}),
    ("DELETE", f"/v1/questions/{DUMMY_ID}", None),
    ("POST", f"/v1/questions/{DUMMY_ID}/attempts", {"is_correct": True}),
    ("GET", f"/v1/questions/{DUMMY_ID}/attempts", None),
    ("GET", f"/v1/mistake-notes/{DUMMY_ID}", None),
    ("PUT", f"/v1/mistake-notes/{DUMMY_ID}", {"memo": "更新"}),
    ("PUT", f"/v1/mistake-notes/{DUMMY_ID}/status", {"status": "active"}),
]


@pytest.fixture()
def token(anon_client) -> str:
    anon_client.post("/v1/auth/register", json={**CREDENTIALS, "name": "テスト太郎"})
    return anon_client.post("/v1/auth/login", json=CREDENTIALS).json()["access_token"]


@pytest.mark.parametrize("path", PROTECTED_PATHS)
def test_request_without_a_token_is_rejected(anon_client, path):
    assert anon_client.get(path).status_code == 401


@pytest.mark.parametrize("path", PROTECTED_PATHS)
def test_request_with_a_garbage_token_is_rejected(anon_client, path):
    response = anon_client.get(path, headers={"Authorization": "Bearer garbage"})
    assert response.status_code == 401


@pytest.mark.parametrize("path", PROTECTED_PATHS)
def test_request_with_a_valid_token_is_accepted(anon_client, token, path):
    response = anon_client.get(path, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_missing_header_returns_401_not_403(anon_client):
    """HTTPBearer の既定は 403。設計どおり 401 に揃っていること。"""
    assert anon_client.get("/v1/subjects").status_code == 401


def test_writes_are_protected_too(anon_client):
    assert anon_client.post("/v1/subjects", json={"name": "数学"}).status_code == 401


@pytest.mark.parametrize("method, path, body", PROTECTED_METHOD_PATHS)
def test_non_get_methods_and_detail_routes_are_protected_too(anon_client, method, path, body):
    response = anon_client.request(method, path, json=body)
    assert response.status_code == 401


def test_health_stays_public(anon_client):
    assert anon_client.get("/health").status_code == 200


def test_register_and_login_stay_public(anon_client):
    registered = anon_client.post(
        "/v1/auth/register", json={**CREDENTIALS, "name": "テスト太郎"}
    )
    assert registered.status_code == 201
    assert anon_client.post("/v1/auth/login", json=CREDENTIALS).status_code == 200


def test_the_openapi_schema_advertises_bearer_auth(anon_client):
    schema = anon_client.get("/openapi.json").json()
    assert "HTTPBearer" in schema["components"]["securitySchemes"]
    assert "security" in schema["paths"]["/v1/subjects"]["get"]
    assert "security" not in schema["paths"]["/v1/auth/login"]["post"]
