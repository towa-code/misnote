import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

import app.models  # noqa: F401 — 全モデルを Base に登録するため
from app.database import Base
from app.deps import get_current_user_id, get_db
from app.main import app as fastapi_app
from app.models.user import User

# 開発用 DB とは別の DB を使う。開発データを壊さないため。
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql://misnote:misnote@localhost:5432/misnote_test"
)


def _ensure_test_database() -> None:
    """misnote_test が無ければ作る。CREATE DATABASE はトランザクション内で実行できない。"""
    base_url, db_name = TEST_DATABASE_URL.rsplit("/", 1)
    admin_engine = create_engine(f"{base_url}/postgres", isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": db_name}
        ).scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))
    admin_engine.dispose()


@pytest.fixture(scope="session")
def engine():
    _ensure_test_database()
    eng = create_engine(TEST_DATABASE_URL)
    # 前回の残骸を消してから作り直す（Alembic は通さない。速度優先）
    Base.metadata.drop_all(eng)
    Base.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture()
def db_session(engine):
    """外側のトランザクションに参加させ、テストごとに丸ごと巻き戻す。

    ルーター側が db.commit() を呼んでも、create_savepoint モードなら
    セーブポイントの解放になるだけで、外側の rollback で全部消える。
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def user(db_session) -> User:
    u = User(email=f"user-{uuid4().hex[:8]}@example.com", name="テストユーザー")
    db_session.add(u)
    db_session.commit()
    return u


@pytest.fixture()
def other_user(db_session) -> User:
    u = User(email=f"other-{uuid4().hex[:8]}@example.com", name="別のユーザー")
    db_session.add(u)
    db_session.commit()
    return u


@pytest.fixture()
def anon_client(db_session):
    """認証していないクライアント。

    with 文で使わないのは lifespan を走らせないため。Task 5 で lifespan は
    無くなるが、それまでは seed が開発用 DB を触ってしまう。
    """
    fastapi_app.dependency_overrides[get_db] = lambda: db_session
    client = TestClient(fastapi_app)
    yield client
    fastapi_app.dependency_overrides.clear()


@pytest.fixture()
def client(anon_client, user):
    """user としてログイン済みのクライアント。

    get_current_user_id を丸ごと差し替えるので、この関数の実装が
    シードユーザー返却から JWT 検証に変わっても、このテストは影響を受けない。
    """
    fastapi_app.dependency_overrides[get_current_user_id] = lambda: user.id
    return anon_client
