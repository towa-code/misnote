import pytest

VALID = {"email": "student@example.com", "password": "password123", "name": "テスト太郎"}


def _register(anon_client, **overrides):
    return anon_client.post("/v1/auth/register", json={**VALID, **overrides})


def test_register_creates_a_user(anon_client):
    response = _register(anon_client)
    assert response.status_code == 201

    body = response.json()
    assert body["email"] == VALID["email"]
    assert body["name"] == VALID["name"]
    assert "id" in body


def test_register_never_leaks_the_password(anon_client):
    body = _register(anon_client).json()
    assert "password" not in body
    assert "password_hash" not in body


def test_register_rejects_a_duplicate_email(anon_client):
    _register(anon_client)

    response = _register(anon_client, name="別人")
    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"


@pytest.mark.parametrize(
    "overrides",
    [
        {"password": "1234567"},  # 8文字未満
        {"email": "not-an-email"},
        {"name": ""},
        {"password": "あ" * 30},  # 90バイト = bcrypt の 72 バイト上限超え
    ],
)
def test_register_rejects_invalid_input_with_422(anon_client, overrides):
    assert _register(anon_client, **overrides).status_code == 422


def test_login_returns_a_bearer_token(anon_client):
    _register(anon_client)

    response = anon_client.post(
        "/v1/auth/login",
        json={"email": VALID["email"], "password": VALID["password"]},
    )
    assert response.status_code == 200

    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"].count(".") == 2  # JWT は3パート


def test_login_with_a_wrong_password_is_rejected(anon_client):
    _register(anon_client)

    response = anon_client.post(
        "/v1/auth/login", json={"email": VALID["email"], "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_login_does_not_reveal_whether_the_email_exists(anon_client):
    """未登録メールとパスワード違いで、応答が区別できないこと。"""
    _register(anon_client)

    wrong_password = anon_client.post(
        "/v1/auth/login", json={"email": VALID["email"], "password": "wrongpassword"}
    )
    unknown_email = anon_client.post(
        "/v1/auth/login", json={"email": "nobody@example.com", "password": "password123"}
    )

    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


def test_login_issues_a_token_for_the_registered_user(anon_client):
    from app.auth import decode_access_token

    user_id = _register(anon_client).json()["id"]
    token = anon_client.post(
        "/v1/auth/login",
        json={"email": VALID["email"], "password": VALID["password"]},
    ).json()["access_token"]

    assert str(decode_access_token(token)) == user_id


def test_me_returns_the_current_user(client, user):
    response = client.get("/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["id"] == str(user.id)
    assert response.json()["email"] == user.email


@pytest.mark.parametrize(
    "password",
    [
        "1234567",  # 8文字未満
        "あ" * 30,  # 90バイト = bcrypt の 72 バイト上限超え
    ],
)
def test_register_422_does_not_leak_the_password(anon_client, password):
    response = _register(anon_client, password=password)
    assert response.status_code == 422
    assert password not in response.text


def test_register_422_does_not_leak_the_password_via_another_field(anon_client):
    """name の入れ忘れなど、password 以外が原因の 422 でも平文を返さないこと。"""
    response = anon_client.post(
        "/v1/auth/register",
        json={"email": VALID["email"], "password": VALID["password"]},
    )
    assert response.status_code == 422
    assert VALID["password"] not in response.text


def test_register_422_still_includes_input_for_non_password_fields(anon_client):
    response = _register(anon_client, email="not-an-email")
    assert response.status_code == 422

    body = response.json()
    assert any(error.get("input") == "not-an-email" for error in body["detail"])


def test_login_calls_verify_password_even_for_an_unknown_email(anon_client):
    """未登録メールでも bcrypt の比較を1回走らせること（応答時間からの推測を防ぐ）。"""
    from unittest.mock import patch

    from app.auth import verify_password

    with patch("app.routers.auth.verify_password", wraps=verify_password) as mock_verify:
        response = anon_client.post(
            "/v1/auth/login",
            json={"email": "nobody@example.com", "password": "whatever123"},
        )

    assert response.status_code == 401
    mock_verify.assert_called_once()
