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
