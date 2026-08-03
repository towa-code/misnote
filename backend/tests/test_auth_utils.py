from datetime import datetime, timedelta, timezone
from uuid import uuid4

from jose import jwt

from app.auth import (
    ALGORITHM,
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.config import settings


def test_hash_is_not_the_plain_password():
    hashed = hash_password("mypassword123")
    assert hashed != "mypassword123"
    assert hashed.startswith("$2b$")


def test_the_same_password_hashes_differently_each_time():
    """ソルトが効いていること。"""
    assert hash_password("mypassword123") != hash_password("mypassword123")


def test_verify_accepts_the_right_password_and_rejects_others():
    hashed = hash_password("mypassword123")
    assert verify_password("mypassword123", hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_verify_returns_false_instead_of_raising_on_oversized_input():
    """bcrypt は 72 バイト超で ValueError を投げる。ログインは 500 ではなく失敗にする。"""
    hashed = hash_password("mypassword123")
    assert verify_password("あ" * 100, hashed) is False


def test_verify_returns_false_on_a_malformed_hash():
    assert verify_password("mypassword123", "not-a-bcrypt-hash") is False


def test_verify_returns_false_when_hash_is_none():
    """password_hash は nullable。未設定ユーザーへのログイン試行でも 500 にしない。"""
    assert verify_password("mypassword123", None) is False


def test_token_round_trips_the_user_id():
    user_id = uuid4()
    assert decode_access_token(create_access_token(user_id)) == user_id


def test_tampered_token_is_rejected():
    token = create_access_token(uuid4())
    assert decode_access_token(token[:-3] + "aaa") is None


def test_token_signed_with_another_key_is_rejected():
    forged = jwt.encode(
        {"sub": str(uuid4()), "exp": datetime.now(timezone.utc) + timedelta(days=1)},
        "some-other-secret",
        algorithm=ALGORITHM,
    )
    assert decode_access_token(forged) is None


def test_expired_token_is_rejected():
    expired = jwt.encode(
        {
            "sub": str(uuid4()),
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    assert decode_access_token(expired) is None


def test_garbage_token_is_rejected():
    assert decode_access_token("not.a.token") is None


def test_token_with_no_sub_claim_is_rejected():
    token = jwt.encode(
        {"exp": datetime.now(timezone.utc) + timedelta(days=1)},
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    assert decode_access_token(token) is None


def test_token_with_null_sub_is_rejected():
    token = jwt.encode(
        {"sub": None, "exp": datetime.now(timezone.utc) + timedelta(days=1)},
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    assert decode_access_token(token) is None


def test_token_with_non_string_sub_is_rejected():
    token = jwt.encode(
        {"sub": 123, "exp": datetime.now(timezone.utc) + timedelta(days=1)},
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    assert decode_access_token(token) is None


def test_token_payload_carries_nothing_but_sub_and_exp():
    """JWT の中身は誰でも読める。余計な情報を入れていないこと。"""
    token = create_access_token(uuid4())
    payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    assert set(payload) == {"sub", "exp"}
